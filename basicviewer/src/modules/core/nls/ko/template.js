define(
({
  viewer:{
    main:{
      scaleBarUnits: "metric" //"english (for miles) or "metric" (for km) - don't translate.
    },
    errors:{
      createMap: "맵을 만들 수 없습니다.",
      bitly: 'bitly가 공유를 위해 url을 단축하는 데 사용됩니다. bitly 키 생성 및 사용에 대한 자세한 내용은 readme 파일을 참조하세요.',
      general: "오류"
    }
  },
  tools:{
    basemap: {
    title: "기본 맵 보기",
    label: "기본 맵"
    },
    print: {
    layouts:{
      label1: '가로(PDF)',
      label2: '세로(PDF)',
      label3: '가로(Image)',
      label4: '세로(Image)'
    },
    title: "맵 인쇄",
    label: "인쇄"
    },
    share: {
    title: "맵 공유",
    label: "공유",
    menu:{
      facebook:{
        label: "Facebook"
       },
      twitter:{
        label: "Twitter"
      },
      email:{
        label: "이메일",
        message: "이 맵 체크 아웃"
      }    
    }
    },
    measure: {
      title: "측정",
      label: "측정"
    },
    time: {
      title: "시간 슬라이더 표시",
      label: "시간",
      timeRange: "<b>시간 범위:</b> ${start_time} ~ ${end_time}",
      timeRangeSingle: "<b>시간 범위:</b> ${time}"
    },
    editor: {
      title: "편집기 표시",
      label: "편집기"
    },
    legend: {
      title: "범례 표시",
      label: "범례"
    },
    details: {
      title: "맵 세부정보 표시",
      label: "설명"
    },
    bookmark:{
      title: "책갈피 표시",
      label: "책갈피",
      details: "책갈피를 클릭하여 위치 탐색"
    },
    layers: {
      title: "레이어 목록 표시",
      label: "레이어"
    },
    search: {
      title: "주소 또는 위치 찾기",
      errors:{
       missingLocation: "위치 없음"
      }
    }
  },
  panel:{
    close:{
      title: "패널 닫기",
      label: "닫기"
    }
  }
})
);