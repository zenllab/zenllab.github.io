const { Dropbox } = require('dropbox');
const fetch = require('isomorphic-fetch'); // Dropbox SDK는 fetch가 필요함
const fs = require('fs'); // 파일 읽기

// Dropbox API 인증 토큰
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN'; // 개발자 페이지에서 받은 액세스 토큰

// Dropbox 클라이언트 초기화
const dbx = new Dropbox({ accessToken: sl.u.AF9hUs1vpWzkUdBciuTHEmneIvCX91PCnmDI8TRen8C_8787m7V6BsgHW3K8wnPCeyntFrbvHg4ZY8uZ0zYZ15XhZ_44s18NWsqv9xXn4fjdbPUBEWyvfevvpJwqLBotZxLB_eYPTVxcRBLsvgVCIXmF2Q4is1qK40Du39-Vsh8txyQXbE99KOnqUNexKq6M-m-e5KOhm-OGEKSkaZ4MR_ubxbQx3Rxo1gvcCBAlmAX0l2nrkZ5rU39P2jPr0kPkKBrYpkNjGLaM7Kry1Ee_YWsqRL7f1i0dTNvQ8pq09wbbHQDSyxVspqxBOlF1ea4Hhdnxhn7imxGCMt7qxKWBg6RUlDy4RNiUyZUF4l1gFjf1wc9gGkrRnkhcGDX8BZ45Ahd3MPBiB0X0Tgv5IinD6nXC_PQuxT7JzeNydrJFFGLtCptJ25efD2Jc7C5Wjlzv1O6pGieSWOmje83xSgeaYoXeW7qqECbH3H1aRcVGD2xuabPbxnGiTsJVMbxMD-Zem5JhCcS4aOJjX8M7Q_52wvMDBZb93uXFMNpYanZJS2JjmV4y1-YpPG0rHJqimis7JVmSlvrI--Sw7v8eHmURSXl4kGUGnuhe-7TVRIMTC0MFZjaB2Wvk0HUBXguaFZhEYj3fecoSlq14XTo8lpkdgzPdYnh-5SzT7Xinqh2dDF9ZvErvq2ODkZgEWLFTZKKtpJURBtMkIwfZ0sr22HIs4OIxen1vma4vDIxARs118gdVDHo-Rm3rSnxMmhc_0zEyvnGaAl-tvHhaK2nQ-lYPKXbr6tfbmJ-GuURega04D14FrlZSozhMXrj0F8J9LPqkBVpRSCmry4GUa2JLKo9HaG2dYAnOJven5vLmD7TfmZoNYlmE5SPalrp2wfvYdX0mToDWEosbYY_e99l436FzoVLGGoerNcAi968FzFiJQ11yliZIoE2lN7JNoDf6FDgWUptwDjoMXsjmXe6euDIkOauN_iZQGcPYNCDLgibDd9F-iGkEZFvQ7jtdZZlvzQ04H5cKphdMSYMOHKEKY3q67m8VlFr6ni-mnjSWXd7OoIdlJUtKcPIlqxQSgbTXS30MZwx_MmfUIrCOiFlPpQbdkWIK06BRBgT_DAEDT2596-YpGPMJLTJUXA9X4FNAXy6QqM_I1prTV72u5xRgYTLbmxM6JUOIlmWtLsuV61i5_R-UVgC5kojlJQ2DOmdG21e7UQxI8aO_grKnkP4o_l1246uT4s--t5X9OxuKXJH45_8vS__9FRLwpCTZm46AEv3uxjeH6P7Xt6h6aKJfD60A2nBCgkNwdxx1mi1Zi21GSINzUw, fetch: fetch });

// 파일 업로드 예제
const uploadFile = async (filePath, dropboxPath) => {
  const fileContent = fs.readFileSync(filePath); // 로컬 파일 읽기
  
  try {
    const response = await dbx.filesUpload({
      path: dropboxPath,
      contents: fileContent
    });
    console.log('File uploaded:', response);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
};

// 로컬 파일을 Dropbox에 업로드
uploadFile('local-file.txt', '/uploaded-file.txt');