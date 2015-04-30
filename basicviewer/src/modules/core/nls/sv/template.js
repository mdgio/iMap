define(
({
  viewer:{
    main:{
      scaleBarUnits: "metric" //"english (for miles) or "metric" (for km) - don't translate.
    },
    errors:{
      createMap: "Det går inte att skapa kartan",
      bitly: 'bitly används för att förkorta URL:en för delning. Information om hur du skapar och använder en bitly-nyckel finns i readme-filen',
      general: "Fel"
    }
  },
  tools:{
    basemap: {
    title: "Byt baskarta",
    label: "Baskarta"
    },
    print: {
    layouts:{
      label1: 'Liggande (PDF)',
      label2: 'Stående (PDF)',
      label3: 'Liggande (bild)',
      label4: 'Stående (bild)'
    },
    title: "Skriv ut karta",
    label: "Skriv ut"
    },
    share: {
    title: "Dela karta",
    label: "Dela",
    menu:{
      facebook:{
        label: "Facebook"
       },
      twitter:{
        label: "Twitter"
      },
      email:{
        label: "E-post",
        message: "Checka ut den här kartan"
      }    
    }
    },
    measure: {
      title: "Mät",
      label: "Mät"
    },
    time: {
      title: "Visa tidsreglage",
      label: "Tid",
      timeRange: "<b>Tidsintervall:</b> ${start_time} till ${end_time}",
      timeRangeSingle: "<b>Tidsintervall:</b> ${time}"
    },
    editor: {
      title: "Visa redigerare",
      label: "Redigerare"
    },
    legend: {
      title: "Visa teckenförklaring",
      label: "Teckenförklaring"
    },
    details: {
      title: "Visa kartdetaljer",
      label: "Information"
    },
    bookmark:{
      title: "Visa bokmärken",
      label: "Bokmärken",
      details: "Klicka på ett bokmärke för att navigera till platsen"
    },
    layers: {
      title: "Visa lagerlista",
      label: "Lager"
    },
    search: {
      title: "Sök efter adress eller plats",
      errors:{
       missingLocation: "Det gick inte att hitta platsen"
      }
    }
  },
  panel:{
    close:{
      title: "Stäng panel",
      label: "Stäng"
    }
  }
})
);