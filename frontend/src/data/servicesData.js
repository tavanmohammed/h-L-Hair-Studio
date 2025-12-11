

import womenHaircut from "../assets/cut2.jpg";
import womenWash from "../assets/wash.jpg";
import womenBlowdry from "../assets/blow.jpg";
import womenStyle from "../assets/styling.jpg";
import bangTrim from "../assets/cut.jpg";
import kids from "../assets/kids.jpg";

import menHaircut from "../assets/men.jpg";
import menFade from "../assets/mencut.jpg";
import beardTrim from "../assets/beard.jpg";
import menWash from "../assets/wash.jpg";

import waxingEyebrows from "../assets/waxing.png";


export const servicesData = {
  women: [
    { id: "w1", name: "Hair Cut", price: "Starts from $20", img: womenHaircut },
    { id: "w2", name: "Wash & Blow Dry", price: "Starts from $35", img: womenWash },
    { id: "w3", name: "Hair Cut, Wash & Blow-Dry", price: "Starts from $35", img: womenBlowdry },
    { id: "w4", name: "Hair Cut, Wash & Style", price: "Starts from $35", img: womenStyle },
    { id: "w5", name: "Bang Trim", price: "$10", img: bangTrim },
    { id: "w6", name: "Kids Hair Cut", price: "$18", img: kids },
  ],
  men: [
    { id: "m1", name: "Hair Cut", price: "Starts from $20", img: menHaircut },
    { id: "m2", name: "Hair & Fade", price: "Starts from $25", img: menFade },
    { id: "m3", name: "Beard Trim", price: "$10", img: beardTrim },
    { id: "m4", name: "Kids Hair Cut", price: "$18", img: kids },
    { id: "m5", name: "Wash & Hair Cut", price: "Starts from $35", img: menWash },
  ],

  aesthetic: [
    { id: "a1", name: "Waxing – Eyebrows", price: "$10" },
    { id: "a2", name: "Waxing – Upper Lip", price: "$5" },
    { id: "a3", name: "Waxing – Chin", price: "$7" },
    { id: "a4", name: "Waxing – Half Arm", price: "$10" },
    { id: "a5", name: "Waxing – Full Arm", price: "$20" },
  ],
  
};
