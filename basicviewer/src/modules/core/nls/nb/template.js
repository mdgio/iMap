define(
({
  viewer:{
    main:{
      scaleBarUnits: "metric" //"english (for miles) or "metric" (for km) - don't translate.
    },
    errors:{
      createMap: "Kan ikke opprette kart",
      bitly: 'bitly brukes til å forkorte URLen for deling. Les readme-filen for detaljer om å opprette og bruke en bitly-nøkkel',
      general: "Feil"
    }
  },
  tools:{
    basemap: {
    title: "Bytt bakgrunnskart",
    label: "Bakgrunnskart"
    },
    print: {
    layouts:{
      label1: 'Liggende (PDF)',
      label2: 'Stående (PDF)',
      label3: 'Liggende (bilde)',
      label4: 'Stående (bilde)'
    },
    title: "Skriv ut kart",
    label: "Skriv ut"
    },
    share: {
    title: "Del kart",
    label: "Del",
    menu:{
      facebook:{
        label: "Facebook"
       },
      twitter:{
        label: "Twitter"
      },
      email:{
        label: "E-post",
        message: "Sjekk ut dette kartet"
      }    
    }
    },
    measure: {
      title: "Mål",
      label: "Mål"
    },
    time: {
      title: "Vis tidskyvebryter",
      label: "Tid",
      timeRange: "<b>Tidsområde:</b> ${start_time} til ${end_time}",
      timeRangeSingle: "<b>Tidsområde:</b> ${time}"
    },
    editor: {
      title: "Vis redigeringsverktøy",
      label: "Redigeringsverktøy"
    },
    legend: {
      title: "Vis tegnforklaring",
      label: "Tegnforklaring"
    },
    details: {
      title: "Vis kartdetaljer",
      label: "Detaljer"
    },
    bookmark:{
      title: "Vis bokmerker",
      label: "Bokmerker",
      details: "Klikk på et bokmerke for å navigere til lokasjonen"
    },
    layers: {
      title: "Vis lagliste",
      label: "Lag"
    },
    search: {
      title: "Finn adresse eller sted",
      errors:{
       missingLocation: "Fant ikke lokasjonen"
      }
    }
  },
  panel:{
    close:{
      title: "Lukk panelet",
      label: "Lukk"
    }
  }
})
);