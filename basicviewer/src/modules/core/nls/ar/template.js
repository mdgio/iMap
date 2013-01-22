define(
({
  viewer:{
    main:{
      scaleBarUnits: "metric" //"english (for miles) or "metric" (for km) - don't translate.
    },
    errors:{
      createMap: "يتعذر إنشاء الخريطة",
      bitly: 'يستخدم bitly لاختصار عنوان url حتى يمكن مشاركته. أظهر ملف \"اقرأني\" للحصول على تفاصيل إنشاء مفتاح bitly واستخدامه',
      general: "خطأ"
    }
  },
  tools:{
    basemap: {
    title: "تبديل خريطة الأساس",
    label: "خريطة أساسية"
    },
    print: {
    layouts:{
      label1: 'وضع أفقي (PDF)',
      label2: 'وضع عمودي (PDF)',
      label3: 'وضع أفقي (صورة)',
      label4: 'وضع عمودي (صورة)'
    },
    title: "طباعة الخريطة",
    label: "طباعة"
    },
    share: {
    title: "مشاركة الخريطة",
    label: "مشاركة",
    menu:{
      facebook:{
        label: "فيس بوك"
       },
      twitter:{
        label: "تويتر"
      },
      email:{
        label: "البريد الإلكتروني",
        message: "فحص الخريطة"
      }    
    }
    },
    measure: {
      title: "قياس",
      label: "قياس"
    },
    time: {
      title: "عرض شريط تمرير الوقت",
      label: "الوقت",
      timeRange: "<b> نطاق الوقت: </b>${start_time} إلى ${end_time}",
      timeRangeSingle: "<b> نطاق الوقت: </b> ${time}"
    },
    editor: {
      title: "عرض المحرر",
      label: "المحرر"
    },
    legend: {
      title: "عرض مفتاح الخريطة",
      label: "مفتاح الخريطة"
    },
    details: {
      title: "عرض تفاصيل الخريطة",
      label: "التفاصيل"
    },
    bookmark:{
      title: "عرض العلامات المرجعية",
      label: "إشارات مرجعية",
      details: "انقر على علامة مرجعية للانتقال إلى الموقع"
    },
    layers: {
      title: "عرض قائمة الطبقات",
      label: "طبقات"
    },
    search: {
      title: "العثور على عنوان أو مكان ما",
      errors:{
       missingLocation: "لم يتم العثور على الموقع"
      }
    }
  },
  panel:{
    close:{
      title: "إغلاق اللوحة",
      label: "إغلاق"
    }
  }
})
);