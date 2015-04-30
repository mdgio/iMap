//http://gis.stackexchange.com/questions/67862/export-dojo-datagrid-results-to-csv-in-javascript-web-application
<%@ WebHandler Language="C#" Class="csv" %>

using System;
using System.Web;

public class csv : IHttpHandler {

public void ProcessRequest (HttpContext context) {
    String content = "no data";
    String filename = "MyFile";
    if (context.Request["report"] != null)
    {
        try
        {
            content = context.Request["report"].ToString();
        }
        catch
        {
        }
    }
    if (context.Request["filename"] != null)
    {
        try
        {
            filename = context.Request["filename"].ToString() + "iMapResults" + "_" + DateTime.Now.ToString("MM_dd_yyyy-HH.mm.ss");
        }
        catch
        {
        }
    }

    context.Response.ContentType = "text/csv";
    context.Response.AddHeader("Content-disposition","attachment;filename="+filename+".csv");
    context.Response.Write(content);
}

public bool IsReusable {
    get {
        return false;
    }
}

}