const TIP_TEXT = {
  UPLOADING: 'Uploading...',
  UPLOAD_SUCCESS: '上传成功',
  UPLOAD_FAILED: '上传失败',
  NO_FILE: '请选择文件',
};

// 每个 chunk 大小
const CHUNK_SIZE = 1024 * 1024;

function createFormData({
  type,
  size,
  fileName,
  uploadedSize,
  file,
  name
}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name);
  formData.append('fileName', fileName);
  formData.append('size', size);
  formData.append('type', type);
  formData.append('uploadedSize', uploadedSize);
  return formData;
}

;((document) => {

  // dom 元素
  const uploadProgress = document.querySelector('#uploadProgress');
  const uploadFile = document.querySelector('#uploadFile');
  const uploadBtn = document.querySelector('#uploadBtn');
  const uploadTips = document.querySelector('#uploadTips');
  
  uploadBtn.addEventListener('click', async () => {

    uploadTips.innerText = '';
    
    const file = uploadFile.files[0];
    if(!file) {
      uploadTips.innerText = TIP_TEXT.NO_FILE
      return;
    }

    const { type, size, name } = file;
    // 进度条
    uploadProgress.setAttribute('max', size)
    uploadTips.innerText = '';

    let uploadedSize = 0;
    const fileName = Date.now() + '_' + name;
    while(uploadedSize < size) {

      // 计算当前 chunk
      const fileChunk = file.slice(uploadedSize, uploadedSize + CHUNK_SIZE);

      // 创建 formData
      const formData = createFormData({
        file: fileChunk,
        uploadedSize,
        fileName,
        type,
        size,
        name
      })

      uploadTips.innerText = TIP_TEXT.UPLOADING;
      // 上传
      fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
      })
        .then((res) => res.json())
        .then((res) => {
          // 更新上传进度
          uploadProgress.value += fileChunk.size;
          if(res?.code === 200) {
            // uploadTips.innerText = TIP_TEXT.UPLOAD_SUCCESS;
            // uploadFile.value = '';
            // uploadProgress.value = "0";
            // uploadProgress.removeAttribute('max');
          }
        })
        .catch((err) => {
          uploadTips.innerText = TIP_TEXT.UPLOAD_FAILED;
        });
      uploadedSize += CHUNK_SIZE;
    }
  });

})(document);
