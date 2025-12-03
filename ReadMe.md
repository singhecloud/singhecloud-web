## Convert Pdf to Image

pdftoppm 0001-1.pdf 0001-1 -jpeg

rename first 
1-9 -> 01
for f in [0-9].pdf; do mv "$f" "$(printf "%03d.pdf" "${f%.pdf}")"; done
10-99 -> 010
for f in [1-9][0-9].pdf; do mv "$f" "$(printf "%03d.pdf" "${f%.pdf}")"; done


combile all pdfs into one

ulimit -S -n 2048
pdfunite *.pdf index.pdf

echo 0 | sudo tee /proc/sys/kernel/apparmor_restrict_unprivileged_userns