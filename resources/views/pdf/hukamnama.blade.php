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

    .pankti {
      font-family: 'opengurbaniakhar-black';
      text-align: center;
      font-size: {{ $fonts['pankti']}}px;
    }
    .pankti.mangal {
        font-size: {{ $fonts['mangal']}}px;
    }
    .translation {
        font-size: {{ $fonts['translation']}}px;
    }
    .title {
        font-family: 'opengurbaniakhar-black';
        text-align: center;
        font-size: {{ $fonts['title']}}px;
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
    <div class="flex flex-col w-full h-full bg-amber-100 p-16">
        <h1 class="title border-4 border-amber-300 text-gray-800 mb-8 bg-amber-200 p-4">
            DMn DMn SRI gurU gRMQ swihb jI dw A~j dw hukmnwmw - AMg {{ $ang }}
        </h1>
    @foreach($groups as $panktis)
        <div class="flex flex-row w-full items-start">
            <!-- Left side: Gurmukhi -->
            <div
                @if ($panktis[0]->type_id == 1 || $panktis[0]->type_id == 2)
                    class="flex-1 text-center mt-4"
                @else
                    class="flex-1 text-justify mt-4"
                @endif
            >
                <span
                    @if ($panktis[0]->type_id == 1)
                        class="pankti mangal text-rose-800 text-center"
                    @elseif($panktis[0]->type_id == 2)
                        class="pankti mangal text-rose-800"
                    @elseif($panktis[0]->type_id == 3)
                        class="pankti rahao text-emerald-900"
                    @else
                        class="pankti text-slate-900"
                    @endif
                >
                    @foreach($panktis as $pankti)
                        {{ str_replace(['.', ';', ','], '', $pankti->gurmukhi) }}{{ ' ' }}
                    @endforeach
                </span>
            </div>

            <!-- Right side: Translation -->
            <div class="ml-16 flex-1 text-justify mt-5 translation text-slate-800 border-l-4 border-slate-400 pl-6">
                <span
                    @if ($panktis[0]->type_id == 1)
                        class=""
                    @elseif($panktis[0]->type_id == 2)
                        class=""
                    @else
                        class=""
                    @endif
                >
                    @foreach($panktis as $pankti)
                        {{ $pankti->translation }}{{ ' ' }}
                    @endforeach
                </span>
            </div>
        </div>
    @endforeach

    <div class="mt-8" style="font-size: 10px">&nbsp;</div>

    <div class="arth mt-auto box-border border-4 border-slate-600 text-slate-800 p-4">
        pd-ArQ:
        @php
            $items = [];
        @endphp

        @foreach($groups as $panktis)
            @foreach($panktis as $pankti)
                @if (!empty(trim($pankti->additional_information)))
                    @php
                        $info = json_decode($pankti->additional_information, true);
                        if (json_last_error() === JSON_ERROR_NONE && !empty($info['arth'])) {
                            $items[] = $info['arth'];
                        }
                    @endphp
                @endif
            @endforeach
        @endforeach

        {{ implode(' [ ', $items) }}
    </div>
    <div style="height: 20px; font-size: 10px;">&nbsp;</div>
</div>

</body>
</html>
