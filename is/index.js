var mySwiper = new Swiper(".swiper", {
  direction: "vertical", // 垂直切换选项
  loop: false, // 循环模式选项
  init: false, // 当你创建一个Swiper实例时是否立即初始化。
  on: {
    // 切换结束时，告诉我现在是第几个slide
    slideChangeTransitionEnd: function () {
      // alert(this.activeIndex);
      // 1. 先让所有的play按钮都处于暂停状态
      $(".play").removeClass("playing");
      // 2. 触发当前slide的play按钮的点击事件
      $(".play").eq(this.activeIndex).trigger("click");
    },
    // 当Swiper切换到最后一个Slide时执行
    reachEnd: function () {
      alert("到了最后一个slide");
      // 可以去再次发送请求，加载下一页视频数据
    },
  },
});

// 1. 发送请求，ajax
getVideoList(0, 10, function (data) {
  var videoList = data.result.list;
  // 遍历 videoList，创建swiper-slide，将创建好的swiper-slide添加到swiper-wrapper
  videoList.forEach(function (item, index, arr) {
    var swiperSlide = $(`
    <div class="swiper-slide">
      <div class="video_box">
        <div class="video_title">${item.title}</div>
        <div class="video_wrap">
          <video
            poster="${item.picurl}"
            src="${item.playurl}"
          ></video>
        </div>
        <div class="video_name">${item.alias}</div>
        <div class="play"></div>
      </div>
    </div>
    `);

    $(".swiper-wrapper").append(swiperSlide);
  });

  // 当swiperSlide添加到页面完毕之后，初始化swiper
  mySwiper.init(); //现在才初始化
});

// 2. 通过事件委托的方式给播放按钮绑定点击事件
$(".swiper-wrapper").on("click", ".play", function () {
  // 0. 让其他的视频都暂停
  $("video").each(function (index, video) {
    video.pause();
  });

  // 1. 让 play 按钮隐藏
  $(this).toggleClass("playing");
  // 2. 找到play按钮对应的video标签，让视频进行播放
  var video = $(this).prevAll(".video_wrap").children("video").get(0);
  if ($(this).hasClass("playing")) {
    video.play();
  } else {
    video.pause();
  }

  var _this = this;

  // 监听当前视频播放结束的事件
  $(video).on("ended", function () {
    // console.log("end~~~");
    $(_this).trigger("click");
  });
});

// 定义一个函数，专门用来发送ajax请求，获取服务器数据
function getVideoList(page, size, cb) {
  // 1. 创建xhr对象
  var xhr = new XMLHttpRequest();
  // 2. 配置请求参数
  xhr.open(
    "GET",
    `https://api.apiopen.top/api/getMiniVideo?page=${page}&size=${size}`
  );
  // 3. 发送请求
  xhr.send();
  // 4. 监听事件
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      var data = JSON.parse(xhr.responseText);
      cb && cb(data);
    }
  };
}
