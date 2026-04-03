// WOMEN
import womenHaircut from "../assets/women-cut.jpeg";
import womenWash from "../assets/wash.jpg";
import womenBlowdry from "../assets/blow.jpg";
import womenStyle from "../assets/styling.jpg";
import bangTrim from "../assets/cut.jpeg";
import kids from "../assets/kids.jpeg";
import kids3 from "../assets/kids3.jpeg";
import kids4 from "../assets/kids.jpeg";

// MEN
import menHaircut from "../assets/men.jpg";
import menFade from "../assets/men.jpg";
import beardTrim from "../assets/beard.jpg";
import menWash from "../assets/men.jpg";

// WAXING
import waxingImg from "../assets/waxing.jpg";

// COLORING
import coloringImg from "../assets/coloring.jpg";

// NAILS
import nailImg from "../assets/nail.jpg";

export const servicesData = {
  women: [
    { id: "w1", name: "Hair Cut", price: "$20 and up", img: womenHaircut },
    { id: "w2", name: "Wash & Blow Dry", price: "$35 and up", img: womenWash },
    { id: "w3", name: "Hair Cut, Wash & Blow-Dry", price: "$45 and up", img: womenBlowdry },
    { id: "w4", name: "Hair Cut, Wash & Style", price: "$45 and up", img: womenStyle },
    { id: "w5", name: "Bang Trim", price: "$10", img: bangTrim },
    { id: "w6", name: "Kids Hair Cut", price: "$15", img: kids3 },
  ],

  men: [
    { id: "m1", name: "Hair Cut", price: "$20 and up", img: menHaircut },
    { id: "m2", name: "Hair & Fade", price: "$25 and up", img: menFade },
    { id: "m3", name: "Beard Trim", price: "$10", img: beardTrim },
    { id: "m4", name: "Kids Hair Cut", price: "$15", img: kids },
    { id: "m5", name: "Wash & Hair Cut", price: "$35 and up", img: menWash },
    { id: "m6", name: "Tuesday Hair Cut", price: "$15", img: menHaircut },
    { id: "m7", name: "Tuesday Kids Hair Cut", price: "$10", img: kids4 },
    { id: "m8", name: "Men hair color", price: "$50", img: menHaircut },
    { id: "m9", name: "Men hair color + Hair cut", price: "$65", img: menHaircut },

  ],

  // 🔥 MOVED waxing OUT of aesthetic and added images
  waxing: [
    { id: "wx1", name: "Eyebrows", price: "$10", img: waxingImg },
    { id: "wx2", name: "Upper Lip", price: "$5", img: waxingImg },
    { id: "wx3", name: "Chin", price: "$7", img: waxingImg },
    { id: "wx4", name: "Half Arm", price: "$10", img: waxingImg },
    { id: "wx5", name: "Full Arm", price: "$20", img: waxingImg },
  ],

  // 🔥 FULL COLORING LIST (you requested)
  coloring: [
    { id: "c1", name: "Root Touch-Up", price: "$50 and up", img: coloringImg },
    { id: "c2", name: "Full Glaze Color", price: "$65 and up", img: coloringImg },
    { id: "c3", name: "Full Highlight", price: "$190 and up", img: coloringImg },
    { id: "c4", name: "Partial Highlight", price: "$150 and up", img: coloringImg },
    { id: "c5", name: "Balayage", price: "$180 and up", img: coloringImg },
    { id: "c6", name: "Perm Short Hair", price: "$150 and up", img: coloringImg },
    { id: "c7", name: "Deep Conditioning Treatment", price: "$50 and up", img: coloringImg },
    { id: "c7", name: "Hair cut + Highlight + Root touch up ", price: "15% Discount", img: coloringImg },
  ],

  // 🔥 FULL NAIL LIST (you requested)
  nails: [
    { id: "n1", name: "Manicure Basic", price: "$25 and up", img: nailImg },
    { id: "n2", name: "Pedicure Basic", price: "$35 and up", img: nailImg },
    { id: "n3", name: "Gel Manicure (Shellac)", price: "$40 and up", img: nailImg },
    { id: "n4", name: "Gel Pedicure", price: "$50 and up", img: nailImg },
    { id: "n5", name: "Full Set Acrylic (BioScript)", price: "$30 and up", img: nailImg },
    { id: "n6", name: "Refill", price: "$45 and up", img: nailImg },
    { id: "n7", name: "Nail Art Design", price: "Starting from $10", img: nailImg },
    { id: "n8", name: "Per Nail 3D Design", price: "$15 and up", img: nailImg },
    { id: "n9", name: "Nail Removal", price: "$50 and up", img: nailImg },
  ],

  
};
