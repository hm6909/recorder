# recorder-note-reader · 리코더 계이름 도우미

React + Vite + TypeScript + CSS + Canvas API로 만든 악보 사진 분석 실험 앱입니다.

## 실행

```sh
npm install
npm run dev
```

터미널의 주소(기본 http://localhost:5173)를 브라우저에서 엽니다. 프로덕션 빌드는 `npm run build`로 만들 수 있습니다.

## 현재 인식 범위

JPG/JPEG/PNG 악보 사진을 브라우저에서 분석합니다. 사진은 서버로 전송하지 않습니다. 현재 실험 인식기는 거의 수평인 오선과 검은 음표 머리를 찾아 음높이 후보를 오버레이합니다. 4단 SATB 악보를 기본으로 파트를 위에서부터 소프라노, 알토, 테너, 베이스로 나눕니다.

이는 완성된 OMR이 아닙니다. 조표와 임시표, 흰 음표, 쉼표, 장식음 및 복잡한 악보는 정확히 처리하지 못할 수 있고 오검출도 있습니다. 표시 결과를 원본 악보와 대조해 주세요.

`src/services/omr/recognizer.ts`에는 영상 처리 실험이, `src/services/omrService.ts`에는 업로드 이미지를 분석기에 전달하고 원본 크기 좌표로 되돌리는 코드가 있습니다. 파트 선택과 Canvas 오버레이는 `src/components`에 있습니다.
