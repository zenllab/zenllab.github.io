const downloadFile = async (dropboxPath, localPath) => {
  try {
    const response = await dbx.filesDownload({ path: dropboxPath });
    const fileContent = response.fileBinary; // 다운로드한 파일 내용
    fs.writeFileSync(localPath, fileContent); // 로컬 파일로 저장
    console.log('File downloaded');
  } catch (error) {
    console.error('Error downloading file:', error);
  }
};

// Dropbox에서 파일을 다운로드하여 로컬에 저장
downloadFile('/uploaded-file.txt', 'downloaded-file.txt');