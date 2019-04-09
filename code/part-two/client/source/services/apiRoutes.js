export const fetchState = address => {
  return fetch(`/api/state/${address}`)
    .then(data => data.json())
    .catch(err => err);
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
