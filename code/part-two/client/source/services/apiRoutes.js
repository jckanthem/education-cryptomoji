export const fetchState = address => {
  return fetch(`/api/state/${address}`)
    .then(data => data.arrayBuffer())
    .then(buffer => String.fromCharCode.apply(null, new Uint8Array(buffer)));
  //)
};
export const fetchStatePartial = partialAddress => {
  return fetch(`/api/state?address=${partialAddress}`).then(data =>
    data.json()
  );
};
export const sendBatch = batches => {
  return fetch(`/api/batches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream"
    },
    body: batches
  }).then(res => res.json());
};
