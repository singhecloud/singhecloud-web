<!DOCTYPE html>
<html lang="pa">
  <head>
    <meta charset="utf-8">
    <style>
      body {
        font-family: 'Noto Sans Gurmukhi', sans-serif;
        font-size: {{ $panktiSize }}px;
        line-height: 1.4;
        padding-top: 10px;
      }
      .pankti {
        font-family: 'gurmukhi';
        text-align: justify;
        margin-bottom: 8px;
        padding-left: 1px;
        padding-right: 1px;
      }
      h1, h2 {
        margin-bottom: 8px;
      }
      
      h1 {
        font-size: {{ $panktiSize }}px;
        padding-bottom: 2px;
        margin-bottom: 2px;
        text-align: center;
      }
      .pankti.mangal {
        color: #2331d1ff;
        text-align: center;
        margin-bottom: 6px;
      }
      .pankti.sirlekh {
        color: #b82525ff;
        text-align: center;
        margin-bottom: 4px;
      }
      
      .divider {
        border: none;
        border-top: 1px solid #aaa;
        margin: 2px 0;
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
    @font-face {
      font-family: 'gurmukhi';
      src: url('/home/sukhpal/Development/singhecloud-web/public/fonts/OpenGurbaniAkhar-Bold.otf');
      font-weight: normal;
      font-style: normal;
    }
    </style>
  </head>
  <body>
    @foreach ($groups as $panktis)
      <div
          @if ($panktis[0]->type_id == 1)
            class="pankti mangal"
          @elseif($panktis[0]->type_id == 2)
            class="pankti sirlekh"
          @else
            class="pankti"
          @endif
        >
          @foreach($panktis as $pankti)
            {{ str_replace(['.', ';', ','], '', $pankti->gurmukhi) . ' ' }}
          @endforeach
      </div>
      @endforeach

      {{-- <div style="width: 100%;height: 20px;"></div>
      <div style="
          width: 100%;
          height: 10px;
          font-size: 6px;
          position: absolute;
          display: flex;
          align-items: center;
          opacity: 0.6;
          bottom: 0;
          left: 20;
          padding-bottom: 4px;
      ">

      <div style="
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
      ">
          {{ $serial . ' / ' . $total }}
      </div>

      <div style="position: absolute; left: 80%; font-family: 'gurmukhi'">AMg: {{ $groups[0][0]->source_page }}</div> --}}
  </div>

      {{-- @if (!$loop->last) --}}
        {{-- <div class="page-break"></div> --}}
      {{-- @endif --}}
  </body>
</html>
