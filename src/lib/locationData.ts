export interface District {
  name: string;
  lat: number;
  lon: number;
}

export const STATE_DISTRICTS: Record<string, District[]> = {
  "Andhra Pradesh": [
    { name: "Anantapur", lat: 14.6819, lon: 77.6006 },
    { name: "Chittoor", lat: 13.2172, lon: 79.1003 },
    { name: "East Godavari", lat: 17.2343, lon: 81.7011 },
    { name: "Guntur", lat: 16.3067, lon: 80.4365 },
    { name: "Krishna", lat: 16.1833, lon: 81.1333 },
    { name: "Kurnool", lat: 15.8281, lon: 78.0373 },
    { name: "Nellore", lat: 14.4426, lon: 79.9864 },
    { name: "Prakasam", lat: 15.5057, lon: 80.0499 },
    { name: "Srikakulam", lat: 18.3160, lon: 83.8943 },
    { name: "Visakhapatnam", lat: 17.6868, lon: 83.2185 },
    { name: "Vizianagaram", lat: 18.1124, lon: 83.3989 },
    { name: "West Godavari", lat: 16.7107, lon: 81.1030 },
    { name: "Kadapa", lat: 14.4713, lon: 78.8242 }
  ],
  "Arunachal Pradesh": [
    { name: "Itanagar (Papum Pare)", lat: 27.0844, lon: 93.6053 },
    { name: "Tawang", lat: 27.5855, lon: 91.8596 },
    { name: "Changlang", lat: 27.1166, lon: 95.7333 },
    { name: "West Kameng", lat: 27.3166, lon: 92.4166 }
  ],
  "Assam": [
    { name: "Kamrup (Guwahati)", lat: 26.1158, lon: 91.7086 },
    { name: "Dibrugarh", lat: 27.4728, lon: 94.9120 },
    { name: "Jorhat", lat: 26.7509, lon: 94.2037 },
    { name: "Silchar", lat: 24.8333, lon: 92.7789 },
    { name: "Tezpur", lat: 26.6338, lon: 92.7925 },
    { name: "Nagaon", lat: 26.3483, lon: 92.6838 }
  ],
  "Bihar": [
    { name: "Patna", lat: 25.5941, lon: 85.1376 },
    { name: "Gaya", lat: 24.7914, lon: 84.9992 },
    { name: "Bhagalpur", lat: 25.2425, lon: 86.9718 },
    { name: "Muzaffarpur", lat: 26.1197, lon: 85.3910 },
    { name: "Darbhanga", lat: 26.1524, lon: 85.8972 },
    { name: "Purnia", lat: 25.7771, lon: 87.4753 },
    { name: "Rohtas", lat: 24.9666, lon: 84.0166 }
  ],
  "Chhattisgarh": [
    { name: "Raipur", lat: 21.2514, lon: 81.6296 },
    { name: "Bilaspur", lat: 22.0790, lon: 82.1391 },
    { name: "Durg", lat: 21.1904, lon: 81.2849 },
    { name: "Bastar (Jagdalpur)", lat: 19.0700, lon: 82.0300 },
    { name: "Surguja (Ambikapur)", lat: 23.1200, lon: 83.2000 }
  ],
  "Goa": [
    { name: "North Goa (Panaji)", lat: 15.4909, lon: 73.8278 },
    { name: "South Goa (Margao)", lat: 15.2736, lon: 73.9581 }
  ],
  "Gujarat": [
    { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
    { name: "Surat", lat: 21.1702, lon: 72.8311 },
    { name: "Vadodara", lat: 22.3072, lon: 73.1812 },
    { name: "Rajkot", lat: 22.3039, lon: 70.8022 },
    { name: "Gandhinagar", lat: 23.2156, lon: 72.6369 },
    { name: "Bhavnagar", lat: 21.7645, lon: 72.1519 },
    { name: "Jamnagar", lat: 22.4707, lon: 70.0577 },
    { name: "Junagadh", lat: 21.5222, lon: 70.4579 },
    { name: "Anand", lat: 22.5645, lon: 72.9289 },
    { name: "Mehsana", lat: 23.6000, lon: 72.4000 }
  ],
  "Haryana": [
    { name: "Gurugram", lat: 28.4595, lon: 77.0266 },
    { name: "Faridabad", lat: 28.4089, lon: 77.3178 },
    { name: "Panipat", lat: 29.3909, lon: 76.9635 },
    { name: "Ambala", lat: 30.3782, lon: 76.7767 },
    { name: "Hisar", lat: 29.1492, lon: 75.7217 },
    { name: "Karnal", lat: 29.6857, lon: 76.9905 },
    { name: "Rohtak", lat: 28.8955, lon: 76.6066 }
  ],
  "Himachal Pradesh": [
    { name: "Shimla", lat: 31.1048, lon: 77.1734 },
    { name: "Kangra (Dharamshala)", lat: 32.2190, lon: 76.3234 },
    { name: "Mandi", lat: 31.5892, lon: 76.9182 },
    { name: "Solan", lat: 30.9045, lon: 77.0967 },
    { name: "Kullu", lat: 31.9579, lon: 77.1095 }
  ],
  "Jharkhand": [
    { name: "Ranchi", lat: 23.3441, lon: 85.3096 },
    { name: "East Singhbhum (Jamshedpur)", lat: 22.8046, lon: 86.2029 },
    { name: "Dhanbad", lat: 23.7957, lon: 86.4304 },
    { name: "Bokaro", lat: 23.6693, lon: 86.1511 },
    { name: "Hazaribagh", lat: 23.9979, lon: 85.3690 }
  ],
  "Karnataka": [
    { name: "Bengaluru Urban", lat: 12.9716, lon: 77.5946 },
    { name: "Mysuru", lat: 12.2958, lon: 76.6394 },
    { name: "Dharwad (Hubli)", lat: 15.4589, lon: 75.0078 },
    { name: "Dakshina Kannada (Mangaluru)", lat: 12.9141, lon: 74.8560 },
    { name: "Belagavi", lat: 15.8497, lon: 74.4977 },
    { name: "Kalaburagi", lat: 17.3297, lon: 76.8343 },
    { name: "Davanagere", lat: 14.4644, lon: 75.9218 },
    { name: "Shimoga", lat: 13.9299, lon: 75.5681 },
    { name: "Vijayapura (Bijapur)", lat: 16.8300, lon: 75.7100 }
  ],
  "Kerala": [
    { name: "Thiruvananthapuram", lat: 8.5241, lon: 76.9366 },
    { name: "Ernakulam (Kochi)", lat: 9.9816, lon: 76.2999 },
    { name: "Kozhikode", lat: 11.2588, lon: 75.7804 },
    { name: "Thrissur", lat: 10.5276, lon: 76.2144 },
    { name: "Palakkad", lat: 10.7867, lon: 76.6547 },
    { name: "Alappuzha", lat: 9.4981, lon: 76.3388 },
    { name: "Kottayam", lat: 9.5916, lon: 76.5224 }
  ],
  "Madhya Pradesh": [
    { name: "Indore", lat: 22.7196, lon: 75.8577 },
    { name: "Bhopal", lat: 23.2599, lon: 77.4126 },
    { name: "Jabalpur", lat: 23.1815, lon: 79.9864 },
    { name: "Gwalior", lat: 26.2183, lon: 78.1828 },
    { name: "Ujjain", lat: 23.1760, lon: 75.7885 },
    { name: "Sagar", lat: 23.8388, lon: 78.7378 },
    { name: "Rewa", lat: 24.5300, lon: 81.3000 },
    { name: "Hoshangabad", lat: 22.7500, lon: 77.7200 }
  ],
  "Maharashtra": [
    { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
    { name: "Pune", lat: 18.5204, lon: 73.8567 },
    { name: "Nagpur", lat: 21.1458, lon: 79.0882 },
    { name: "Nashik", lat: 19.9975, lon: 73.7898 },
    { name: "Aurangabad (Chhatrapati Sambhajinagar)", lat: 19.8762, lon: 75.3433 },
    { name: "Thane", lat: 19.2183, lon: 72.9781 },
    { name: "Solapur", lat: 17.6599, lon: 75.9064 },
    { name: "Kolhapur", lat: 16.7050, lon: 74.2433 },
    { name: "Amravati", lat: 20.9320, lon: 77.7523 },
    { name: "Jalgaon", lat: 21.0077, lon: 75.5626 },
    { name: "Satara", lat: 17.6800, lon: 73.9800 }
  ],
  "Manipur": [
    { name: "Imphal West", lat: 24.8170, lon: 93.9368 },
    { name: "Imphal East", lat: 24.7997, lon: 93.9606 }
  ],
  "Meghalaya": [
    { name: "East Khasi Hills (Shillong)", lat: 25.5788, lon: 91.8931 },
    { name: "West Garo Hills (Tura)", lat: 25.5147, lon: 90.2227 }
  ],
  "Mizoram": [
    { name: "Aizawl", lat: 23.7271, lon: 92.7176 },
    { name: "Lunglei", lat: 22.8864, lon: 92.7381 }
  ],
  "Nagaland": [
    { name: "Kohima", lat: 25.6751, lon: 94.1086 },
    { name: "Dimapur", lat: 25.9064, lon: 93.7270 }
  ],
  "Odisha": [
    { name: "Khurda (Bhubaneswar)", lat: 20.2961, lon: 85.8245 },
    { name: "Cuttack", lat: 20.4625, lon: 85.8830 },
    { name: "Sundargarh (Rourkela)", lat: 22.2604, lon: 84.8536 },
    { name: "Sambalpur", lat: 21.4669, lon: 83.9812 },
    { name: "Puri", lat: 19.8134, lon: 85.8312 },
    { name: "Ganjam (Berhampur)", lat: 19.3150, lon: 84.7941 },
    { name: "Balasore", lat: 21.4934, lon: 86.9333 }
  ],
  "Punjab": [
    { name: "Ludhiana", lat: 30.9010, lon: 75.8573 },
    { name: "Amritsar", lat: 31.6340, lon: 74.8723 },
    { name: "Jalandhar", lat: 31.3260, lon: 75.5762 },
    { name: "Patiala", lat: 30.3398, lon: 76.3869 },
    { name: "Bathinda", lat: 30.2110, lon: 74.9455 },
    { name: "Firozpur", lat: 30.9262, lon: 74.6139 },
    { name: "Hoshiarpur", lat: 31.5147, lon: 75.9112 }
  ],
  "Rajasthan": [
    { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
    { name: "Jodhpur", lat: 26.2389, lon: 73.0243 },
    { name: "Udaipur", lat: 24.5854, lon: 73.7125 },
    { name: "Kota", lat: 25.2138, lon: 75.8648 },
    { name: "Bikaner", lat: 28.0166, lon: 73.3119 },
    { name: "Ajmer", lat: 26.4499, lon: 74.6399 },
    { name: "Alwar", lat: 27.5530, lon: 76.6346 },
    { name: "Sri Ganganagar", lat: 29.9171, lon: 73.8740 }
  ],
  "Sikkim": [
    { name: "Gangtok", lat: 27.3314, lon: 88.6138 }
  ],
  "Tamil Nadu": [
    { name: "Chennai", lat: 13.0827, lon: 80.2707 },
    { name: "Coimbatore", lat: 11.0168, lon: 76.9558 },
    { name: "Madurai", lat: 9.9252, lon: 78.1198 },
    { name: "Tiruchirappalli", lat: 10.7905, lon: 78.7047 },
    { name: "Salem", lat: 11.6643, lon: 78.1460 },
    { name: "Tirunelveli", lat: 8.7139, lon: 77.7567 },
    { name: "Erode", lat: 11.3410, lon: 77.7172 },
    { name: "Vellore", lat: 12.9165, lon: 79.1325 },
    { name: "Thanjavur", lat: 10.7870, lon: 79.1378 },
    { name: "Tuticorin", lat: 8.7642, lon: 78.1348 }
  ],
  "Telangana": [
    { name: "Hyderabad", lat: 17.3850, lon: 78.4867 },
    { name: "Warangal", lat: 17.9689, lon: 79.5941 },
    { name: "Nizamabad", lat: 18.6725, lon: 78.0941 },
    { name: "Karimnagar", lat: 18.4386, lon: 79.1288 },
    { name: "Khammam", lat: 17.2473, lon: 80.1514 },
    { name: "Mahabubnagar", lat: 16.7300, lon: 77.9800 },
    { name: "Nalgonda", lat: 17.0500, lon: 79.2700 }
  ],
  "Tripura": [
    { name: "West Tripura (Agartala)", lat: 23.8315, lon: 91.2868 }
  ],
  "Uttar Pradesh": [
    { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
    { name: "Kanpur Nagar", lat: 26.4499, lon: 80.3319 },
    { name: "Ghaziabad", lat: 28.6692, lon: 77.4538 },
    { name: "Agra", lat: 27.1767, lon: 78.0081 },
    { name: "Varanasi", lat: 25.3176, lon: 82.9739 },
    { name: "Meerut", lat: 28.9845, lon: 77.7064 },
    { name: "Prayagraj (Allahabad)", lat: 25.4358, lon: 81.8463 },
    { name: "Bareilly", lat: 28.3607, lon: 79.4300 },
    { name: "Gautam Buddha Nagar (Noida)", lat: 28.5355, lon: 77.3910 },
    { name: "Gorakhpur", lat: 26.7606, lon: 83.3731 }
  ],
  "Uttarakhand": [
    { name: "Dehradun", lat: 30.3165, lon: 78.0322 },
    { name: "Haridwar", lat: 29.9457, lon: 78.1642 },
    { name: "Nainital (Haldwani)", lat: 29.2183, lon: 79.5126 }
  ],
  "West Bengal": [
    { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
    { name: "Howrah", lat: 22.5958, lon: 88.2636 },
    { name: "Darjeeling", lat: 27.0410, lon: 88.2627 },
    { name: "Paschim Bardhaman (Asansol)", lat: 23.6889, lon: 86.9749 },
    { name: "Purba Medinipur", lat: 21.9000, lon: 87.7500 },
    { name: "Murshidabad", lat: 24.1800, lon: 88.2700 }
  ],
  "Delhi": [
    { name: "New Delhi", lat: 28.6139, lon: 77.2090 }
  ],
  "Jammu & Kashmir": [
    { name: "Srinagar", lat: 34.0837, lon: 74.7973 },
    { name: "Jammu", lat: 32.7266, lon: 74.8570 }
  ],
  "Puducherry": [
    { name: "Puducherry", lat: 11.9416, lon: 79.8083 }
  ],
  "Chandigarh": [
    { name: "Chandigarh", lat: 30.7333, lon: 76.7794 }
  ],
  "Ladakh": [
    { name: "Leh", lat: 34.1526, lon: 77.5771 }
  ]
};

export const INDIAN_STATES = Object.keys(STATE_DISTRICTS);

export function getDistrictByStateAndName(state: string, name: string): District | undefined {
  return STATE_DISTRICTS[state]?.find(d => d.name === name);
}
