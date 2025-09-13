<!DOCTYPE html>
<html lang="pa">
<head>
  <meta charset="utf-8">
  <title></title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    html,body{
        width: 100%;
        height: 100%;
    }

    .title {
        font-family: 'opengurbaniakhar-black';
        text-align: center;
        font-size: {{ $fonts['title']}}px;
    }
    .gurmukhi {
      font-family: 'opengurbaniakhar-black';
      text-align: center;
      font-size: {{ $fonts['pankti']}}px;
    }
    .arth {
        font-family: 'opengurbaniakhar-black';
        font-size: {{ $fonts['arth']}}px;
    }
    @font-face {
        font-family: 'riyasti-naveen';
        src: url('/home/sukhpal/Development/singhecloud-web/public/fonts/riyasti-naveen.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
    }
    @font-face {
        font-family: 'opengurbaniakhar-black';
        src: url('/home/sukhpal/Development/singhecloud-web/public/fonts/opengurbaniakhar-black.otf');
        font-weight: normal;
        font-style: normal;
    }
    @font-face {
        font-family: 'anmolunibaniheavy';
        src: url('/home/sukhpal/Development/singhecloud-web/public/fonts/anmolunibaniheavy.otf');
        font-weight: normal;
        font-style: normal;
    }
  </style>
</head>
<body class="flex">
    <div class="flex flex-col w-full h-full bg-amber-100 p-10">
        <h1 class="title border-4 border-amber-300 text-gray-800 mb-2 bg-amber-200 text-center p-2">
            DMn DMn SRI gurU gRMQ swihb jI dw A~j dw hukmnwmw - AMg {{ $ang }}
        </h1>
        <div class="flex-1 w-full text-justify items-center justify-center gurmukhi mt-12">
            @foreach($groups as $panktis)
                @foreach($panktis as $pankti)
                        {{ str_replace(['.', ';', ','], '', $pankti->gurmukhi) }}{{ ' ' }}
                @endforeach
            @endforeach
        </div>
</body>
</html>
