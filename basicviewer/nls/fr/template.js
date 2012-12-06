define(
({
  viewer:{
    main:{
      scaleBarUnits: "metric" //"english (for miles) or "metric" (for km) - don't translate.
    },
    errors:{
      createMap: "Impossible de créer la carte",
      bitly: 'bitly permet de raccourcir l\'URL pour le partage. Consultez le fichier Lisezmoi pour plus d\'informations sur la création et l\'utilisation d\'une clé bitly',
      general: "Erreur"
    }
  },
  tools:{
    basemap: {
    title: "Inverser le fond de carte",
    label: "Fond de carte"
    },
    print: {
    layouts:{
      label1: 'Paysage (PDF)',
      label2: 'Portrait (PDF)',
      label3: 'Paysage (Image)',
      label4: 'Portrait (Image)'
    },
    title: "Imprimer la carte",
    label: "Imprimer"
    },
    share: {
    title: "Partager la carte",
    label: "Partager",
    menu:{
      facebook:{
        label: "Facebook"
       },
      twitter:{
        label: "Twitter"
      },
      email:{
        label: "Adresse électronique",
        message: "Extraire cette carte"
      }    
    }
    },
    measure: {
      title: "Mesurer",
      label: "Mesurer"
    },
    time: {
      title: "Afficher le curseur temporel",
      label: "Heure",
      timeRange: "<b>Plage de temps :</b> de ${start_time} à ${end_time}",
      timeRangeSingle: "<b>Plage de temps :</b> ${time}"
    },
    editor: {
      title: "Afficher l\'éditeur",
      label: "Editeur"
    },
    legend: {
      title: "Afficher la légende",
      label: "Légende"
    },
    details: {
      title: "Afficher les détails de la carte",
      label: "Détails"
    },
    bookmark:{
      title: "Afficher les géosignets",
      label: "Géosignets",
      details: "Cliquez sur un géosignet pour accéder à l\'emplacement"
    },
    layers: {
      title: "Afficher la liste des couches",
      label: "Couches"
    },
    search: {
      title: "Rechercher une adresse ou un lieu",
      errors:{
       missingLocation: "Emplacement introuvable"
      }
    }
  },
  panel:{
    close:{
      title: "Fermer le volet",
      label: "Fermer"
    }
  }
})
);