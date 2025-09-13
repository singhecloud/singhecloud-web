<!DOCTYPE html>
<html lang="pa">
<head>
  <meta charset="utf-8">
  <title>Shabads {{ $startSerial }}–{{ $startSerial + 49 }}</title>
  <style>
    body {
      font-family: 'Noto Sans Gurmukhi', sans-serif;
      font-size: 30px;
      line-height: 1.7;
    }
    h1, h2 {
      margin-bottom: 8px;
    }
    h1 {
      font-size: 12px;
      padding-bottom: 6px;
      margin-bottom: 20px;
      text-align: center;
    }
    .mangal {
      color: #2331d1ff;
    }
    .sirlekh {
      color: #b82525ff;
    }
    .pankti {
      white-space: pre-wrap;
      font-family: 'riyasti-naveen';
      text-align: center;
    }
    .divider {
      border: none;
      border-top: 1px solid #aaa;
      margin: 24px 0;
    }
    .page-break {
      page-break-after: always;
    }
    @font-face {
    font-family: 'riyasti-naveen';
    src: url('/home/sukhpal/Development/singhecloud-web/public/fonts/riyasti-naveen.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  </style>
</head>
<body>

  @foreach($shabads as $index => $shabad)
    <h1>[{{ $startSerial + $index }}]</h1>
    @foreach($panktis[$shabad->id] ?? [] as $pankti)
      <div 
        @if ($pankti->type_id == 1)
          class="pankti mangal"
        @elseif($pankti->type_id == 2)
          class="pankti sirlekh"
        @else
          class="pankti"
        @endif
      >{{ str_replace(['.', ';', ','], '', $pankti->gurmukhi) }}</div>
    @endforeach

    {{-- @if (!$loop->last) --}}
      <div class="page-break"></div>
    {{-- @endif --}}
  @endforeach
</body>
</html>
