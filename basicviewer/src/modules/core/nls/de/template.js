define(
({
  viewer:{
    main:{
      scaleBarUnits: "metric" //"english (for miles) or "metric" (for km) - don't translate.
    },
    errors:{
      createMap: "Karte kann nicht erstellt werden",
      bitly: 'Bitly verkürzt die URL für die Freigabe. Details zum Erstellen und Verwenden von Bitly-Schlüsseln finden Sie in der Readme-Datei.',
      general: "Fehler"
    }
  },
  tools:{
    basemap: {
    title: "Grundkarte wechseln",
    label: "Grundkarte"
    },
    print: {
    layouts:{
      label1: 'Querformat (PDF)',
      label2: 'Hochformat (PDF)',
      label3: 'Querformat (Bild)',
      label4: 'Hochformat (Bild)'
    },
    title: "Karte drucken",
    label: "Drucken"
    },
    share: {
    title: "Karte freigeben",
    label: "Freigeben",
    menu:{
      facebook:{
        label: "Facebook"
       },
      twitter:{
        label: "Twitter"
      },
      email:{
        label: "E-Mail",
        message: "Diese Karte ansehen"
      }    
    }
    },
    measure: {
      title: "Messen",
      label: "Messen"
    },
    time: {
      title: "Zeitschieberegler anzeigen",
      label: "Zeit",
      timeRange: "<b>Zeitbereich:</b> ${start_time} bis ${end_time}",
      timeRangeSingle: "<b>Zeitbereich:</b> ${time}"
    },
    editor: {
      title: "Editor anzeigen",
      label: "Editor"
    },
    legend: {
      title: "Legende anzeigen",
      label: "Legende"
    },
    details: {
      title: "Kartendetails anzeigen",
      label: "Details"
    },
    bookmark:{
      title: "Lesezeichen anzeigen",
      label: "Lesezeichen",
      details: "Klicken Sie auf ein Lesezeichen, um zu einer Position zu navigieren"
    },
    layers: {
      title: "Layer-Liste anzeigen",
      label: "Layer"
    },
    search: {
      title: "Adresse oder Ort suchen",
      errors:{
       missingLocation: "Position nicht gefunden"
      }
    }
  },
  panel:{
    close:{
      title: "Fenster schließen",
      label: "Schließen"
    }
  }
})
);