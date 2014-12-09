define(
({
  viewer:{
    main:{
      scaleBarUnits: "metric" //"english (for miles) or "metric" (for km) - don't translate.
    },
    errors:{
      createMap: "Не удалось создать карту",
      bitly: 'Для сокращения url при предоставления общего доступа используется ключ bitly. Информация о создании и использовании ключа bitly находится в файле readme.',
      general: "Ошибка"
    }
  },
  tools:{
    basemap: {
    title: "Переключить базовую карту",
    label: "Базовая карта"
    },
    print: {
    layouts:{
      label1: 'Альбомная (PDF)',
      label2: 'Книжная (PDF)',
      label3: 'Альбомная (Image)',
      label4: 'Книжная (Image)'
    },
    title: "Печать карты",
    label: "Печать"
    },
    share: {
    title: "Общий доступ к карте",
    label: "Общий доступ",
    menu:{
      facebook:{
        label: "Facebook"
       },
      twitter:{
        label: "Twitter"
      },
      email:{
        label: "Email",
        message: "Открепить карту"
      }    
    }
    },
    measure: {
      title: "Измерить",
      label: "Измерить"
    },
    time: {
      title: "Показать бегунок времени",
      label: "Время",
      timeRange: "<b>Временной диапазон:</b> ${start_time} to ${end_time}",
      timeRangeSingle: "<b>Временной диапазон:</b> ${time}"
    },
    editor: {
      title: "Показать редактор",
      label: "Редактор"
    },
    legend: {
      title: "Показать легенду",
      label: "Легенда"
    },
    details: {
      title: "Просмотр информации о карте",
      label: "Детали"
    },
    bookmark:{
      title: "Показать закладки",
      label: "Закладки",
      details: "Щелкните закладку, чтобы перейти к местоположению"
    },
    layers: {
      title: "Показать список слоев",
      label: "Слои"
    },
    search: {
      title: "Найти адрес или место",
      errors:{
       missingLocation: "Местоположение не найдено"
      }
    }
  },
  panel:{
    close:{
      title: "Закрыть панель",
      label: "Закрыть"
    }
  }
})
);