define(
({
  viewer:{
    main:{
      scaleBarUnits: "metric" //"english (for miles) or "metric" (for km) - don't translate.
    },
    errors:{
      createMap: "Impossibile creare la mappa",
      bitly: 'a livello di bit viene utilizzata per abbreviare l\'URL per la condivisione. Per informazioni dettagliate sulla creazione e l\'utilizzo di una chiave a livello di bit, vedere il file Readme.',
      general: "Errore"
    }
  },
  tools:{
    basemap: {
    title: "Cambia mappa di base",
    label: "Mappa di base"
    },
    print: {
    layouts:{
      label1: 'Orizzontale (PDF)',
      label2: 'Verticale (PDF)',
      label3: 'Orizzontale (immagine)',
      label4: 'Verticale (immagine)'
    },
    title: "Stampa mappa",
    label: "Stampa"
    },
    share: {
    title: "Condividi mappa",
    label: "Condividi",
    menu:{
      facebook:{
        label: "Facebook"
       },
      twitter:{
        label: "Twitter"
      },
      email:{
        label: "E-mail",
        message: "Guarda questa mappa"
      }    
    }
    },
    measure: {
      title: "Misura",
      label: "Misura"
    },
    time: {
      title: "Visualizza cursore temporale",
      label: "Data/Ora",
      timeRange: "<b>Intervallo di tempo:</b> da ${start_time} a ${end_time}",
      timeRangeSingle: "<b>Intervallo di tempo:</b> ${time}"
    },
    editor: {
      title: "Visualizza editor",
      label: "Editor"
    },
    legend: {
      title: "Visualizza legenda",
      label: "Legenda"
    },
    details: {
      title: "Visualizza dettagli mappa",
      label: "Dettagli"
    },
    bookmark:{
      title: "Visualizza segnalibri",
      label: "Segnalibri",
      details: "Fare clic su un segnalibro per passare alla posizione corrispondente"
    },
    layers: {
      title: "Visualizza elenco layer",
      label: "Layer"
    },
    search: {
      title: "Trova luogo o indirizzo",
      errors:{
       missingLocation: "Impossibile trovare la località"
      }
    }
  },
  panel:{
    close:{
      title: "Chiudi pannello",
      label: "Chiudi"
    }
  }
})
);