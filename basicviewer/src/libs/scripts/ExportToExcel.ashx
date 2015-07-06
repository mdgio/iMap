<%@ WebHandler Language="C#" Class="ExportToExcel" %>

using System;
using System.IO;
using System.Web;
using System.Xml;
using System.Xml.Xsl;
using Newtonsoft.Json;
using System.Collections;
using System.Collections.Generic;
using System.Dynamic;
using System.Xml.Serialization;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.Web.Script.Serialization;
using System.Xml.Linq;
using System.Text;

public class ExportToExcel : IHttpHandler {

    private HttpContext _context;
    private XmlNode _exportNode;
    
    public void ProcessRequest (HttpContext context) {
        _context = context;

        DoExport();
    }
    private void DoExport()
    {
        string format = _context.Request["exportFormat"];

        if (string.IsNullOrEmpty(format) || format.Trim().Length == 0)
        {
            DoEndWithBadResponseStatus();
            return;
        }

        string export = _context.Request["fileContent"];
        string exportWithRoot = string.Format("{{ \"records\": {{ \"record\": {0} }} }}", export);
        
        _exportNode = JsonConvert.DeserializeXmlNode(exportWithRoot);
        //Object _exportNodeObj = new JavaScriptSerializer().DeserializeObject(exportWithRoot);
        
        //_exportNode = SerializeObjectToXmlNode(_exportNodeObj);
        
        string fileName = _context.Request["fileName"];        
        
        switch (format)
        {
            case "excel":
                ExportToExcelFunc(fileName);
                break;

            case "csv":
                ExportToCsv(fileName);
                break;

            default:
                DoEndWithBadResponseStatus();
                return;
        }
    }

    public static XmlNode SerializeObjectToXmlNode(Dictionary<String, Object> obj)
    {
        if (obj == null)
            throw new ArgumentNullException("Argument cannot be null");

        XmlNode resultNode = null;
        XmlSerializer xmlSerializer = new XmlSerializer(obj.GetType());
        using (MemoryStream memoryStream = new MemoryStream())
        {
            try
            {
                xmlSerializer.Serialize(memoryStream, obj);
            }
            catch (InvalidOperationException)
            {
                return null;
            }
            memoryStream.Position = 0;
            XmlDocument doc = new XmlDocument();
            doc.Load(memoryStream);
            resultNode = doc.DocumentElement;
        }
        return resultNode;
    }

    private void DoEndWithBadResponseStatus()
    {
        _context.Response.StatusCode = 400;
        _context.Response.StatusDescription = "Bad Request";
        _context.Response.End();
    }

    private void ExportToExcelFunc(string fileName)
    {
        DoTransform("application/vnd.ms-excel", fileName + ".xls", "Excel.xsl");
    }

    private void ExportToCsv(string fileName)
    {
        DoTransform("text/csv", fileName + ".csv", "Csv.xsl");
    }

    private void DoTransform(string contentType, string fileName, string xsltPath)
    {
        _context.Response.Clear();
        _context.Response.ContentType = contentType;
        _context.Response.AddHeader("Content-Disposition", "attachment; filename=" + fileName);

        var xtExcel = new XslCompiledTransform();
        xtExcel.Load(_context.Server.MapPath(xsltPath));
        xtExcel.Transform(_exportNode, null, _context.Response.OutputStream);

        _context.Response.End();
    }

    public bool IsReusable
    {
        get { return false; }
    }

}