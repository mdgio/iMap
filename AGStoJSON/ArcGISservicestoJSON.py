#-------------------------------------------------------------------------------
# Name:        ArcGIS Services Directory to JSON
# Purpose:
#
# Author:      SSporik
#
# Created:     12/02/2013
# Copyright:   (c) SSporik 2013
# Licence:     <your licence>
#-------------------------------------------------------------------------------
import httplib, urllib, json
import sys
import getpass
import collections

def main(argv=None):
    # Ask for admin/publisher user name and password
    #username = raw_input("Enter user name: ")
    username = ""
    #password = getpass.getpass("Enter password: ")
    password = ""

    # Ask for server name & port
    # serverName = raw_input("Enter server name: ")
    serverName = ""
    serverPort = 80
    alias = ""

    # Get the location and the name of the file to be created
    #resultFile = raw_input("Output File: ")
    resultFile = "C:\Temp\ArcGISservicesJSON.txt"

    # Specify JSON output format, set pretty = TRUE for pretty Format. Otherwise output will be one long string.
    pretty = True

    # Get a token
    token = getToken(username, password, serverName, serverPort)

    # Get the root info
    serverURL = "/arcgis/admin/services/"

    # This request only needs the token and the response formatting parameter
    params = urllib.urlencode({'token': token, 'f': 'json'})

    headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/plain"}

    # Connect to URL and post parameters
    httpConn = httplib.HTTPConnection(serverName, serverPort)
    httpConn.request("POST", serverURL, params, headers)

    # Read response
    response = httpConn.getresponse()
    if (response.status != 200):
        httpConn.close()
        print "Could not read folder information."
        return
    else:
        data = response.read()

        # Display the response in pretty format
        #result = json.dumps(json.loads(data), sort_keys=True, indent=4)
        #print result

        serviceResultFile = open(resultFile,'w')

        #write the root of the JSON object store(name: servername, id: root)  All folders are children of the root.
        if alias == "":
            alias = serverName

        ln = "{ \"name\": \"" + alias + "\", \"id\": \"root\", \"children\":["
        serviceResultFile.write(ln)

        # Deserialize response into Python object
        dataObj = json.loads(data)
        httpConn.close()

        #Store the Folders in a list to loop on
        folders = dataObj["folders"]

        #Remove the System and Utilities folders
        folders.remove("System")
        folders.remove("Utilities")

        #Add an entry for the root folder
        folders.append("")

        f = 0
        #Loop on the found folders and discover the services and write the service information
        for folder in folders:

            # Determine if the loop is working on the root folder or not
            if folder != "":
                folder += "/"

            # Build the URL for the current folder
            folderURL = "/arcgis/admin/services/" + folder
            params = urllib.urlencode({'token': token, 'f': 'json'})
            headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/plain"}

            # Connect to URL and post parameters
            httpConn = httplib.HTTPConnection(serverName, serverPort)
            httpConn.request("POST", folderURL, params, headers)

            # Read response
            response = httpConn.getresponse()
            if (response.status != 200):
                httpConn.close()
                print "Could not read folder information:" + folderURL
                return
            else:
                data = response.read()

                # Check that data returned is not an error object
                if not assertJsonSuccess(data):
                    print "Error when reading folder information. " + str(data)
                else:
                    print "Processed folder information successfully. Now processing services..."

                # Deserialize response into Python object
                dataObj = json.loads(data)
                httpConn.close()

                if folder != "" and folder != "/":
                    label = folder.replace("/", "")
                    fURL = "http://" + serverName + folderURL.replace("admin", "rest")

                    #ln = "{nodetype: " + nodetype + ", label: " + label + ", url: '" + folderURL + "', serviceType: '" + serviceType +"' }"
                    ln = "{\"name\": \"" + label + "\", \"id\": \"" + label + "\", \"url\": \"" + fURL + "\", \"children\": ["
                    print ln
                    serviceResultFile.write(ln)
                    ln = ""

                # Loop through each service in the folder if is not protected (webEncrypted = false)
                if dataObj["webEncrypted"] == False:
                    i = 0
                    for item in dataObj["services"]:

                        if item["type"] == "MapServer":

                            # Build the Service URL
                            if folder:
                                sUrl = "/arcgis/admin/services/%s%s.%s" %(folder,item["serviceName"], item["type"])
                            else:
                                sUrl = "/arcgis/admin/services/%s.%s" %(item["serviceName"], item["type"])

                            # Submit the request to the server
                            httpConn.request("POST", sUrl, params, headers)

                            # Get the response
                            servResponse = httpConn.getresponse()
                            readData = servResponse.read()
                            jsonOBJ = json.loads(readData)

                            # Build the Service URL to test the running status
                            if folder:
                                statusUrl = "/arcgis/admin/services/%s%s/%s/status" %(folder,item["serviceName"], item["type"])
                            else:
                                statusUrl = "/arcgis/admin/services/%s/%s/status" %(item["serviceName"], item["type"])

                            # Submit the request to the server
                            httpConn.request("POST", statusUrl, params, headers)

                            # Get the response
                            servStatusResponse = httpConn.getresponse()
                            readData = servStatusResponse.read()
                            jsonOBJStatus = json.loads(readData)

                            #remove folder name from service name by splitting at the "/"
                            strName = jsonOBJ["serviceName"]
                            trimName = strName.split("/")
                            displayName = trimName[-1]

                            mapServiceURL = "http://" + serverName + statusUrl.replace("admin", "rest").replace("status", "")

                            ln = "{\"name\": \"" + displayName + "\", \"id\":\"" + displayName + "\", \"url\": \"" + mapServiceURL + "\", \"type\": \"" + str(item["type"]) + "\" }"
                            if i != 0:
                                ln = "," + ln
                            print ln

                            # Write the results to the file
                            serviceResultFile.write(ln)
                            ln = ""
                            i += 1
                            httpConn.close()

                        elif item["type"] == "ImageServer":

                            # Build the Service URL
                            if folder:
                                sUrl = "/arcgis/admin/services/%s%s.%s" %(folder,item["serviceName"], item["type"])
                            else:
                                sUrl = "/arcgis/admin/services/%s.%s" %(item["serviceName"], item["type"])

                            # Submit the request to the server
                            httpConn.request("POST", sUrl, params, headers)

                            # Get the response
                            servResponse = httpConn.getresponse()
                            readData = servResponse.read()
                            jsonOBJ = json.loads(readData)

                            # Build the Service URL to test the running status
                            if folder:
                                statusUrl = "/arcgis/admin/services/%s%s/%s/status" %(folder,item["serviceName"], item["type"])
                            else:
                                statusUrl = "/arcgis/admin/services/%s/%s/status" %(item["serviceName"], item["type"])

                            # Submit the request to the server
                            httpConn.request("POST", statusUrl, params, headers)

                            # Get the response
                            servStatusResponse = httpConn.getresponse()
                            readData = servStatusResponse.read()
                            jsonOBJStatus = json.loads(readData)

                            # Extract the WMS properties from the response
                            wmsProps = [imageWMS for imageWMS in jsonOBJ["extensions"] if imageWMS["typeName"] == 'WMSServer']#.items()[0][1] == 'WMSServer']

                            if len(wmsProps) > 0:
                                wmsStatus = str(wmsProps[0]["enabled"])
                            else:
                                wmsStatus = "NA"


                            # Remove folder name from service name by splitting at the "\"
                            strName = jsonOBJ["serviceName"]
                            trimName = strName.split("/")
                            displayName = trimName[-1]

                            imageServiceURL =  "http://" + serverName + statusUrl.replace("admin", "rest").replace("status", "")

                            ln = "{\"name\": \"" + displayName + "\", \"id\": \"" + displayName + "\", \"url\": \"" + imageServiceURL + "\", \"type\": \"" + str(item["type"]) + "\" }"
                            if i != 0:
                                ln = "," + ln
                            print ln


                            # Write the results to the file
                            serviceResultFile.write(ln)
                            ln = ""
                            i += 1
                            httpConn.close()
                        else:
                            # Close the connection to the current service
                            httpConn.close()
            # Close the children array [] and the JSON object for the folder.
            if folder != "" and folder != "/":
                ln = "] } "
            if f < (len(folders) - 2):
                ln = ln + ","
            print ln
            serviceResultFile.write(ln)
            ln = ""
            f += 1
            #exit for folder

        # Close children list of the root object
        ln = "] }"
        serviceResultFile.write(ln)
        serviceResultFile.close()

        if pretty == True:
            # Read the entire contents of the result file in one string
            serviceResultFile = open(resultFile,'r')
            data = json.loads(serviceResultFile.read(), object_pairs_hook=collections.OrderedDict)
            serviceResultFile.close()

            # Pass the contents of the file to JSON object to rewrite in Pretty Format
            json.encoder.c_make_encoder = None
            result = json.dumps(data, sort_keys=False, indent=4)


            # Clear the result file
            serviceResultFile = open(resultFile,'w')
            serviceResultFile.truncate()

            # Replace with Pretty Format JSON
            serviceResultFile.write(result)

            # Close the file
            serviceResultFile.close()

def getToken(username, password, serverName, serverPort):
    # Token URL is typically http://server[:port]/arcgis/admin/generateToken
    tokenURL = "/arcgis/admin/generateToken"

    params = urllib.urlencode({'username': username, 'password': password, 'client': 'requestip', 'f': 'json'})

    headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/plain"}

    # Connect to URL and post parameters
    httpConn = httplib.HTTPConnection(serverName, serverPort)
    httpConn.request("POST", tokenURL, params, headers)

    # Read response
    response = httpConn.getresponse()
    if (response.status != 200):
        httpConn.close()
        print "Error while fetching tokens from admin URL. Please check the URL and try again."
        return
    else:
        data = response.read()
        httpConn.close()

        # Check that data returned is not an error object
        if not assertJsonSuccess(data):
            return

        # Extract the token from it
        token = json.loads(data)
        return token['token']


# A function that checks that the input JSON object
#  is not an error object.
def assertJsonSuccess(data):
    obj = json.loads(data)
    if 'status' in obj and obj['status'] == "error":
        print "Error: JSON object returns an error. " + str(obj)
        return False
    else:
        return True

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
