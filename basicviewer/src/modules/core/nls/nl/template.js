define(
({
  viewer:{
    main:{
      scaleBarUnits: "metric" //"english (for miles) or "metric" (for km) - don't translate.
    },
    errors:{
      createMap: "Kan kaart niet maken",
      bitly: 'Bitly wordt gebruikt om de URL die u wilt delen, korter te maken. Bekijk het leesmij-bestand voor details over het maken en gebruiken van een bitly-code',
      general: "Fout"
    }
  },
  tools:{
    basemap: {
    title: "Basiskaart wijzigen",
    label: "Basiskaart"
    },
    print: {
    layouts:{
      label1: 'Liggend (PDF)',
      label2: 'Staand (PDF)',
      label3: 'Liggend (afbeelding)',
      label4: 'Staand (afbeelding)'
    },
    title: "Pagina openen om kaart af te drukken",
    label: "Afdrukken"
    },
    share: {
    title: "Kaart delen",
    label: "Delen",
    menu:{
      facebook:{
        label: "Facebook"
       },
      twitter:{
        label: "Twitter"
      },
      email:{
        label: "E-mail",
        message: "Bekijk deze kaart"
      }    
    }
    },
    measure: {
      title: "Meten",
      label: "Meten"
    },
    time: {
      title: "Tijdschuifregelaar weergeven",
      label: "Tijd",
      timeRange: "<b>Tijdspanne:</b> ${start_time} tot ${end_time}",
      timeRangeSingle: "<b>Tijdspanne:</b> ${time}"
    },
    editor: {
      title: "Editor weergeven",
      label: "Editor"
    },
    legend: {
      title: "Legenda weergeven",
      label: "Legenda"
    },
    details: {
      title: "Kaartdetails weergeven",
      label: "Details"
    },
    bookmark:{
      title: "Bladwijzers weergeven",
      label: "Bladwijzers",
      details: "Klik op een bladwijzer om naar de locatie te navigeren"
    },
    layers: {
      title: "Lijst met lagen weergeven",
      label: "Kaartlagen"
    },
    search: {
      title: "Adres of plaats zoeken",
      errors:{
       missingLocation: "Locatie niet gevonden"
      }
    }
  },
  panel:{
    close:{
      title: "Sluiten",
      label: "Sluiten"
    }
  }
})
);