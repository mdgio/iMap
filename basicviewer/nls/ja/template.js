define(
({
  viewer:{
    main:{
      scaleBarUnits: "metric" //"english (for miles) or "metric" (for km) - don't translate.
    },
    errors:{
      createMap: "マップを作成できません",
      bitly: 'bitly を使用すると共有する URL を短縮できます。bitly キーの作成と使用の詳細については、Readme ファイルをご参照ください。',
      general: "エラー"
    }
  },
  tools:{
    basemap: {
    title: "ベースマップの切り替え",
    label: "ベースマップ"
    },
    print: {
    layouts:{
      label1: '横（PDF）',
      label2: '縦（PDF）',
      label3: '横（画像）',
      label4: '縦（画像）'
    },
    title: "マップの印刷",
    label: "印刷"
    },
    share: {
    title: "マップの共有",
    label: "共有",
    menu:{
      facebook:{
        label: "Facebook"
       },
      twitter:{
        label: "Twitter"
      },
      email:{
        label: "E メール",
        message: "このマップをチェック アウト"
      }    
    }
    },
    measure: {
      title: "計測",
      label: "計測"
    },
    time: {
      title: "タイム スライダの表示",
      label: "時間",
      timeRange: "<b>時間の範囲:</b> ${start_time} ～ ${end_time}",
      timeRangeSingle: "<b>時間の範囲:</b> ${time}"
    },
    editor: {
      title: "エディタの表示",
      label: "編集"
    },
    legend: {
      title: "凡例の表示",
      label: "凡例"
    },
    details: {
      title: "マップ詳細の表示",
      label: "詳細"
    },
    bookmark:{
      title: "ブックマークの表示",
      label: "ブックマーク",
      details: "ブックマークをクリックすると、その場所へ移動します"
    },
    layers: {
      title: "レイヤ リストの表示",
      label: "レイヤ"
    },
    search: {
      title: "住所または場所の検索",
      errors:{
       missingLocation: "場所が見つかりません"
      }
    }
  },
  panel:{
    close:{
      title: "パネルを閉じる",
      label: "閉じる"
    }
  }
})
);