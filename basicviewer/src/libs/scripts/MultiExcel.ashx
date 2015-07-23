<%@ WebHandler Language="C#" Class="MultiExcel" %>

using System;
using System.IO;
using System.Web;
using System.Xml;
using System.Data;
using System.ComponentModel;
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
using ClosedXML.Excel;

public class MultiExcel : IHttpHandler {

    private HttpContext _context;

    public void ProcessRequest(HttpContext context)
    {
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

        dynamic dtObjects = JsonConvert.DeserializeObject(export);
        
        string fileName = _context.Request["fileName"];
        
        //create the worksheets and save the file
        XLWorkbook wb = new XLWorkbook();
        
        for (var i=0; i < dtObjects.Count; i++){
             string json = JsonConvert.SerializeObject(dtObjects[i]["exportItems"]);
             DataTable dt = (DataTable)JsonConvert.DeserializeObject(json, (typeof(DataTable)));
             string wsName = dtObjects[i]["name"].ToString();
             if (wsName.Length > 30) 
                 wsName = wsName.Substring(0, 30);
             wb.Worksheets.Add(dt, wsName);
        }

        MemoryStream stream = GetStream(wb);

        _context.Response.Clear();
        _context.Response.Buffer = true;
        _context.Response.AddHeader("content-disposition", "attachment; filename=" + fileName + ".xlsx");
        _context.Response.ContentType = "application/vnd.ms-excel";
        _context.Response.BinaryWrite(stream.ToArray());
        _context.Response.End();
        
    }

    public MemoryStream GetStream(XLWorkbook excelWorkbook)
    {
        MemoryStream fs = new MemoryStream();
        excelWorkbook.SaveAs(fs);
        fs.Position = 0;
        return fs;
    }

    private void DoEndWithBadResponseStatus()
    {
        _context.Response.StatusCode = 400;
        _context.Response.StatusDescription = "Bad Request";
        _context.Response.End();
    }

    public bool IsReusable
    {
        get { return false; }
    }

}