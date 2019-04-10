import { decode } from "./encoding";
import axios from "axios";
export const fetchState = address => {
  return axios
    .get(`/api/state/${address}`)
    .then(({ data }) => decode(data))
    .catch(err => err);
  //)
};
export const fetchStatePartial = partialAddress => {
  return fetch(`/api/state?address=${partialAddress}`).then(data =>
    data.json()
  );
};
export const sendBatch = batches => {
  // return fetch(`/api/batches`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/octet-stream"
  //   },
  //   body: batches
  // }).then(res => res.json());
  return axios({
    method: "POST",
    url: "/api/batches",
    data: batches,
    headers: { "Content-Type": "application/octet-stream" }
  }).then(({ data }) => console.log(data));
};
