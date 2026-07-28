export async function getPresignedUrl({
  endpoint,
  fileName,
  contentType,
  extraPayload = {},
  postRequest,
}) {
  const payload = { fileName, contentType, ...extraPayload };
  const res = await postRequest(endpoint, payload);
  const { statusCode, data } = res.data || {};
  if (!(statusCode === 200 && data?.uploadUrl)) {
    throw new Error("Failed to obtain upload URL");
  }
  return {
    uploadUrl: data.uploadUrl,
    key: data.fileKey || data.key || fileName,
    fileKey: data.fileKey || data.key || fileName,
    fileType: data.fileType || contentType,
  };
}

export async function putFileToPresignedUrl({ uploadUrl, file, contentType }) {
  const resp = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Upload failed: ${resp.status} ${text}`);
  }
  return true;
}

export async function uploadSingleFile({
  endpoint,
  file,
  postRequest,
  extraPayload,
}) {
  const contentType = file.type || "application/octet-stream";
  const { uploadUrl, key, fileKey } = await getPresignedUrl({
    endpoint,
    fileName: file.name,
    contentType,
    extraPayload,
    postRequest,
  });
  await putFileToPresignedUrl({ uploadUrl, file, contentType });
  return { key, fileKey, uploadUrl };
}

export async function uploadMultipleFiles({
  endpoint,
  files,
  postRequest,
  extraPayload,
  concurrency = 4,
  onProgress,
}) {
  const list = Array.from(files || []);
  const total = list.length;
  let completed = 0;
  const results = new Array(total);

  let index = 0;
  const worker = async () => {
    while (index < total) {
      const i = index++;
      const file = list[i];
      try {
        const res = await uploadSingleFile({
          endpoint,
          file,
          postRequest,
          extraPayload,
        });
        results[i] = { ...res, file };
      } catch (err) {
        results[i] = { error: err, file };
      } finally {
        completed++;
        onProgress && onProgress(completed, total);
      }
    }
  };

  const workers = Array.from({ length: Math.min(concurrency, total) }, worker);
  await Promise.all(workers);
  return results;
}
