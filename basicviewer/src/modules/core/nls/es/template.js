define(
({
  viewer:{
    main:{
      scaleBarUnits: "metric" //"english (for miles) or "metric" (for km) - don't translate.
    },
    errors:{
      createMap: "No se puede crear el mapa",
      bitly: 'bitly se usa para acortar la url para compartir. Vea el archivo léame para más información sobre cómo crear y usar una clave bitly',
      general: "Error"
    }
  },
  tools:{
    basemap: {
    title: "Cambiar mapa base",
    label: "Mapa base"
    },
    print: {
    layouts:{
      label1: 'Horizontal (PDF)',
      label2: 'Vertical (PDF)',
      label3: 'Horizontal (Imagen)',
      label4: 'Vertical (Imagen)'
    },
    title: "Imprimir mapa",
    label: "Imprimir"
    },
    share: {
    title: "Compartir mapa",
    label: "Compartir",
    menu:{
      facebook:{
        label: "Facebook"
       },
      twitter:{
        label: "Twitter"
      },
      email:{
        label: "Correo electrónico",
        message: "Examinar este mapa"
      }    
    }
    },
    measure: {
      title: "Medir",
      label: "Medir"
    },
    time: {
      title: "Mostrar control deslizante de tiempo",
      label: "Hora",
      timeRange: "<b>Intervalo de tiempo:</b>de ${start_time} a ${end_time}",
      timeRangeSingle: "<b>Intervalo de tiempo:</b> ${time}"
    },
    editor: {
      title: "Mostrar editor",
      label: "Editor"
    },
    legend: {
      title: "Mostrar leyenda",
      label: "Leyenda"
    },
    details: {
      title: "Mostrar detalles del mapa",
      label: "Detalles"
    },
    bookmark:{
      title: "Mostrar marcadores",
      label: "Marcadores",
      details: "Haga clic en un marcador para ir a la ubicación"
    },
    layers: {
      title: "Mostrar lista de capas",
      label: "Capas"
    },
    search: {
      title: "Buscar dirección o lugar",
      errors:{
       missingLocation: "Ubicación o encontrada"
      }
    }
  },
  panel:{
    close:{
      title: "Cerrar panel",
      label: "Cerrar"
    }
  }
})
);