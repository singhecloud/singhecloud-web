<!DOCTYPE html>
<html lang="pa">
<head>
  <meta charset="utf-8">
  <title></title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    html, body {
      height: 100%;  /* make body fill viewport */
      margin: 0;     /* remove default margins */
    }

    .gurmukhi {
      font-family: 'riyasti-naveen';
      text-align: center;
      font-size: {{ $fontSize }}px;
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

    .flower-border {
      /* 4 backgrounds: top, bottom, left, right */
    background:
      url('/home/sukhpal/Development/singhecloud-web/public/images/flower1.png') top left / 16px 16px repeat-x,
      url('/home/sukhpal/Development/singhecloud-web/public/images/flower1.png') bottom left / 16px 16px repeat-x,
      url('/home/sukhpal/Development/singhecloud-web/public/images/flower1.png') top left / 16px 16px repeat-y,
      url('/home/sukhpal/Development/singhecloud-web/public/images/flower1.png') top right / 16px 16px repeat-y;
    box-sizing: border-box;
    background-color: #fff; /* your page bg */
    }
  </style>
</head>
<body class="gurmukhi flex flex-col min-h-screen p-4">
  <div class="h-full w-full text-justify text-balance pt-6 pb-8 pl-8 pr-8 flower-border">
    @php $headerBuffer = []; @endphp

    @foreach ($panktis as $pankti)
      @php
        $isHeader = in_array($pankti->type_id, [1, 2], true);
        $text = str_replace(['.', ';', ',', ' '], ' ', $pankti->gurmukhi);
      @endphp

      @if ($isHeader)
        @php $headerBuffer[] = $text; @endphp
      @else
        @if (!empty($headerBuffer))
          <div class="text-center font-bolder" style="font-size: {{ $fontSize + ($fontSize * 0.1) }}px">
            {{ implode(' ', $headerBuffer) }}
          </div>
          @php $headerBuffer = []; @endphp
        @endif

        {{ $text }}
      @endif
    @endforeach

    @if (!empty($headerBuffer))
      <div class="text-center font-bolder" style="font-size: {{ $fontSize + ($fontSize * 0.1) }}px">
        {{ implode(' ', $headerBuffer) }}
      </div>
    @endif

    <div style="height: 20px">&nbsp;</div>
  </div>

  <div class="absolute w-full text-center" style="bottom: 8px">
    <span class="rounded-md px-6 py-1 text-sm font-semibold bg-white">
    {{ ' ' . $ang . ' ' }}
    </span>
  </div>
</body>
</html>
