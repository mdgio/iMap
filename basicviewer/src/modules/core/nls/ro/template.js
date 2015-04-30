define(
({
  viewer:{
    main:{
      scaleBarUnits: "metric" //"english (for miles) or "metric" (for km) - don't translate.
    },
    errors:{
      createMap: "Imposibil de creat harta",
      bitly: 'O cheie bitly este utilizată pentru scurtarea URL-ului în vederea partajării. Vizualizaţi fişierul readme pentru detalii despre crearea şi utilizarea unei chei bitly',
      general: "Eroare"
    }
  },
  tools:{
    basemap: {
    title: "Schimbare hartă fundal",
    label: "Hartă fundal"
    },
    print: {
    layouts:{
      label1: 'Peisaj (PDF)',
      label2: 'Portret (PDF)',
      label3: 'Peisaj (Imagine)',
      label4: 'Portret (Imagine)'
    },
    title: "Imprimare hartă",
    label: "Imprimare"
    },
    share: {
    title: "Partajare hartă",
    label: "Partajare",
    menu:{
      facebook:{
        label: "Facebook"
       },
      twitter:{
        label: "Twitter"
      },
      email:{
        label: "Email",
        message: "Consultare această hartă"
      }    
    }
    },
    measure: {
      title: "Măsurare",
      label: "Măsurare"
    },
    time: {
      title: "Afişare glisor de timp",
      label: "Timp",
      timeRange: "<b>Interval de timp:</b> de la ${start_time} până la ${end_time}",
      timeRangeSingle: "<b>Interval de timp:</b> ${time}"
    },
    editor: {
      title: "Afişare editor",
      label: "Editor"
    },
    legend: {
      title: "Afişare legendă",
      label: "Legendă"
    },
    details: {
      title: "Afişare detalii hartă",
      label: "Detalii"
    },
    bookmark:{
      title: "Afişare semne de carte",
      label: "Semne de carte",
      details: "Faceţi clic pe un semn de carte pentru a naviga către locaţia respectivă"
    },
    layers: {
      title: "Afişare listă straturi tematice",
      label: "Straturi tematice"
    },
    search: {
      title: "Găsire adresă sau loc",
      errors:{
       missingLocation: "Locaţie negăsită"
      }
    }
  },
  panel:{
    close:{
      title: "Închidere panou",
      label: "Închidere"
    }
  }
})
);