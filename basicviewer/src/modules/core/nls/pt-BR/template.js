define(
({
  viewer:{
    main:{
      scaleBarUnits: "metric" //"english (for miles) or "metric" (for km) - don't translate.
    },
    errors:{
      createMap: "Não foi possível criar o mapa",
      bitly: 'O bitly é utilizado para diminuir a url para compartilhamento. Consulte o arquivo Leia-Me para detalhes sobre criar e utilizar a tecla bitly',
      general: "Erro"
    }
  },
  tools:{
    basemap: {
    title: "Trocar Mapa Base",
    label: "Mapa Base"
    },
    print: {
    layouts:{
      label1: 'Paisagem (PDF)',
      label2: 'Retrato (PDF)',
      label3: 'Paisagem (imagem)',
      label4: 'Retrato (imagem)'
    },
    title: "Imprimir Mapa",
    label: "Imprimir"
    },
    share: {
    title: "Compartilhar Mapa",
    label: "Compartilhar",
    menu:{
      facebook:{
        label: "Facebook"
       },
      twitter:{
        label: "Twitter"
      },
      email:{
        label: "E-mail",
        message: "Desconectar mapa"
      }    
    }
    },
    measure: {
      title: "Medir",
      label: "Medir"
    },
    time: {
      title: "Exibir Seletor de Tempo",
      label: "Tempo",
      timeRange: "<b>Intervalo de Tempo:</b> ${start_time} até ${end_time}",
      timeRangeSingle: "<b>Intervalo de Tempo:</b> ${time}"
    },
    editor: {
      title: "Exibir Editor",
      label: "Editor"
    },
    legend: {
      title: "Exibir Legenda",
      label: "Legenda"
    },
    details: {
      title: "Exibir Detalhes do Mapa",
      label: "Detalhes"
    },
    bookmark:{
      title: "Exibir Marcadores",
      label: "Marcadores",
      details: "Clique em um marcador para navegar até o local"
    },
    layers: {
      title: "Exibir lista de camada",
      label: "Camadas"
    },
    search: {
      title: "Localizar endereço ou lugar",
      errors:{
       missingLocation: "Local não encontrado"
      }
    }
  },
  panel:{
    close:{
      title: "Fechar Painel",
      label: "Fechar"
    }
  }
})
);