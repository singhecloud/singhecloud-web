<!DOCTYPE html>
<html lang="pa">
  <head>
    <meta charset="utf-8">
    <style>
      body {
        font-family: 'Noto Sans Gurmukhi', sans-serif;
        font-size: {{ $panktiSize }}px;
        line-height: 1.4;
        padding-top: 40px;
        padding-left: 20px;
        padding-right: 20px;
        padding-bottom: 20px;
      }

      @page {
        margin: 10mm 5mm 10mm 5mm;
      }

      .pankti {
        font-family: 'gurmukhi';
        text-align: justify;
        padding-bottom: 40px;
        width: 100%;
      }

      h1, h2 {
        margin-bottom: 8px;
      }

      p.line {
        padding: 0;
        margin: 0;
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
        padding-bottom: 10px;
      }

      .pankti.sirlekh {
        color: #b82525ff;
        text-align: center;
        padding-top: 10px;
        padding-bottom: 10px;
      }

      .no-margin {
          padding-bottom: 0 !important;
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
      
          @php
            $classes = [
                'pankti',
                $panktis[0]->type_id == 1 ? 'mangal' : '',
                $panktis[0]->type_id == 2 ? 'sirlekh' : '',
                $panktis[0]->section == 0 ? 'no-margin' : '',
            ];
        @endphp

        <div class="{{ implode(' ', array_filter($classes)) }}">

        @php
          $count = count($panktis);
        @endphp

        @for ($i = 0; $i < $count; $i++)
          @php
            /** @var \App\Models\Pankti $pankti */
            $pankti = $panktis[$i];
          @endphp

          {{-- ⭐ CASE: 2 or 4 panktis in a single row (Option A: consume next items) --}}
          @if ($pankti->split_pankti == 2 || $pankti->split_pankti == 4)
            @php
              $cols  = $pankti->split_pankti;
              $group = [];

              for ($j = 0; $j < $cols && ($i + $j) < $count; $j++) {
                  $p       = $panktis[$i + $j];
                  $text    = str_replace(['.', ','], '', $p->gurmukhi);
                  $group[] = trim($text);
              }

              // Skip the panktis we just consumed
              $i += count($group) - 1;
            @endphp

            <div style="margin-bottom:4px; white-space:nowrap; width:100%; display:flex; gap:0.5em;">
              @foreach ($group as $text)
                <span>{{ $text }}</span>
              @endforeach
            </div>

          @else
            @php
              $line = str_replace(['.', ','], '', $pankti->gurmukhi);

              if (!str_contains($line, ';')) {
                  $left = trim($line);
                  $right = '';
              } else {
                  [$left, $right] = explode(';', $line, 2);
                  $left  = trim($left);
                  $right = trim($right);
              }
            @endphp

            @if ($pankti->split_pankti == 1)
              <div style="margin-bottom:2px; white-space:nowrap; width:100%;">
                {{ $left }}
              </div>

              <div style="margin-bottom:4px; white-space:nowrap; width:100%;">
                {{ $right }}
              </div>

            @else
              <div style="margin-bottom:4px; white-space:nowrap; width:100%;">
                <span style="margin-right:0.9em;">{{ $left }}</span>
                <span>{{ $right }}</span>
              </div>
            @endif

          @endif
        @endfor

      </div>
    @endforeach
  </body>
</html>
