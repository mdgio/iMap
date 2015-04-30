define(
({
  viewer:{
    main:{
      scaleBarUnits: "metric" //"english (for miles) or "metric" (for km) - don't translate.
    },
    errors:{
      createMap: "无法创建地图",
      bitly: 'bitly 用于缩短共享 url。有关创建和使用 bitly 密钥的详细信息，请查看自述文件',
      general: "错误"
    }
  },
  tools:{
    basemap: {
    title: "切换底图",
    label: "底图"
    },
    print: {
    layouts:{
      label1: '横向(PDF)',
      label2: '纵向(PDF)',
      label3: '横向(图像)',
      label4: '纵向(图像)'
    },
    title: "打印地图",
    label: "打印"
    },
    share: {
    title: "共享地图",
    label: "共享",
    menu:{
      facebook:{
        label: "Facebook"
       },
      twitter:{
        label: "Twitter"
      },
      email:{
        label: "电子邮件",
        message: "检出该地图"
      }    
    }
    },
    measure: {
      title: "测量",
      label: "测量"
    },
    time: {
      title: "显示时间滑块",
      label: "时间",
      timeRange: "<b>时间范围:</b> ${start_time} 至 ${end_time}",
      timeRangeSingle: "<b>时间范围:</b> ${time}"
    },
    editor: {
      title: "显示编辑器",
      label: "编辑器"
    },
    legend: {
      title: "显示图例",
      label: "图例"
    },
    details: {
      title: "显示地图详细信息",
      label: "详细信息"
    },
    bookmark:{
      title: "显示书签",
      label: "书签",
      details: "单击书签导航至该位置"
    },
    layers: {
      title: "显示图层列表",
      label: "图层"
    },
    search: {
      title: "查找地址或地点",
      errors:{
       missingLocation: "未找到位置"
      }
    }
  },
  panel:{
    close:{
      title: "关闭面板",
      label: "关闭"
    }
  }
})
);