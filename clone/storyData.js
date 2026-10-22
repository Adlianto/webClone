window.LANGS = [['en', 'English'], ['id', 'Bahasa Indonesia']]; window.LANG = new URLSearchParams(location.search).get('lang') === 'id' ? 'id' : 'en'; function setLang(l) { const u = new URL(location.href); u.searchParams.set('lang', l); location.replace(u.href); }
// Original Bandung campus AU. Sources and fictionalisation: RESEARCH.md.
const STORY_META = {
    "id": "bandung-v2",
    "title": "SOFT LAUNCH",
    "campus": "Institut Teknologi Bumi",
    "district": "Gantara",
    "city": "Bandung",
    "minji": "Informatics Engineering (Teknik Informatika) · semester 5",
    "Hanni": "Desain Komunikasi Visual (DKV) · semester 5"
};
const chatData = {
    "Hanni": [],
    "Danielle": [
        [
            "오늘",
            "date"
        ],
        [
            "hari ini kalian pasang display jam empat ya. aku ambil kunci dulu",
            "them",
            "7:01 AM"
        ],
        [
            "Oke, nuhun. Aku sama Hanni bawa print-nya.",
            "me",
            "7:02 AM"
        ],
        [
            "sip. kalian boleh makan dulu, tapi jangan lupa balik 😭",
            "them",
            "7:02 AM"
        ]
    ],
    "Haerin": [
        [
            "어제",
            "date"
        ],
        [
            "webnya udah aku buka di HP. tombol balik aman",
            "them",
            "4:10 PM"
        ],
        [
            "Makasih Rin. Kalau nemu yang aneh kabarin ya.",
            "me",
            "4:11 PM"
        ],
        [
            "yang aneh cuma folder backup kamu isinya backup lagi",
            "them",
            "4:12 PM"
        ],
        [
            "Itu sengaja.",
            "me",
            "4:12 PM"
        ],
        [
            "오늘",
            "date"
        ],
        [
            "min aku pinjam adaptor HDMI sore ya",
            "them",
            "7:05 AM"
        ],
        [
            "Boleh. Ada di kantong depan tas.",
            "me",
            "7:06 AM"
        ]
    ],
    "Hyein": [
        [
            "오늘",
            "date"
        ],
        [
            "Kak, sisa kertasnya boleh buat aku?",
            "them",
            "6:54 AM"
        ],
        [
            "Boleh, tapi cek dulu Hanni masih perlu atau enggak.",
            "me",
            "6:55 AM"
        ],
        [
            "Sudah tanya. Disuruh ambil yang ga ada tanda potongnya wkwk",
            "them",
            "6:55 AM"
        ],
        [
            "Oke. Jangan lupa cutter-nya dibalikin ya.",
            "me",
            "6:56 AM"
        ]
    ],
    "Mom": [
        [
            "어제",
            "date"
        ],
        [
            "Lagi apa, Nak?",
            "them",
            "7:12 PM"
        ],
        [
            "Baru sampai kos, Bu. Habis ambil cetakan sama teman.",
            "me",
            "7:14 PM"
        ],
        [
            "Sudah makan?",
            "them",
            "7:14 PM"
        ],
        [
            "Sudah. Nanti telepon sebentar ya setelah mandi.",
            "me",
            "7:15 PM"
        ],
        [
            "Iya. Jangan tidur terlalu malam.",
            "them",
            "7:15 PM"
        ]
    ],
    "Jejak team": [
        [
            "오늘",
            "date"
        ],
        [
            "Danielle: reminder pasang display jam empat. jangan bawa kopi deket print ya",
            "them",
            "6:50 AM"
        ],
        [
            "Haerin: adaptor sama kabel aku bawa",
            "them",
            "6:51 AM"
        ],
        [
            "Web offline sama backup fotonya di aku.",
            "me",
            "6:52 AM"
        ],
        [
            "Hanni: print caption aku ambil setelah studio. makan siang dulu ya semuanya",
            "them",
            "6:53 AM"
        ],
        [
            "Hyein: siapa pun yang lewat kos aku tolong bawain lakban",
            "them",
            "6:54 AM"
        ]
    ],
    "Exhibit desk": [
        [
            "어제",
            "date"
        ],
        [
            "Danielle: Kak, izin konfirmasi akses Gantara Hall untuk Rabu pukul 16.00.",
            "them",
            "3:02 PM"
        ],
        [
            "Admin: Baik, kunci bisa diambil di meja panitia. Area harus dirapikan setelah acara.",
            "them",
            "3:14 PM"
        ],
        [
            "Siap, Kak. Terima kasih.",
            "me",
            "3:16 PM"
        ]
    ]
};
const chatNames = Object.keys(chatData);
const notes = [
    [
        "JEJAK / checklist Rabu",
        "Informatika × DKV · 21 Oktober",
        "16.00 ambil kunci di meja panitia\n16.30 cek display\n17.00 pameran dibuka\n\nMinji: web archive, laptop, kabel\nHanni: layout dan print caption\nDanielle: kunci dan meja\nHaerin: adaptor dan tes di HP\nHyein: lakban, gunting\n\nFile final cukup satu folder. Nama pembuat tetap dicantumkan. Balikin ruangan dalam keadaan rapi.",
        "2026-10-21"
    ],
    [
        "Jangan janji kalau jadwal belum pasti",
        "Kamis kemarin",
        "Praktikum molor. Hanni nunggu makan siang padahal setelah itu dia masih ada studio.\n\nLain kali kabarin sebelum jam janjian, bukan setelah dicari. Kalau belum tau selesai jam berapa, bilang belum tau.",
        "2026-10-16"
    ],
    [
        "Belanja kos",
        "Biar ga bolak-balik",
        "Deterjen\nAir minum\nRoti\nBaterai mouse\n\nSekalian ambil cucian kalau sudah jadi.",
        "2026-10-19"
    ],
    [
        "Sabtu",
        "Belum pilih tempat",
        "Tanya jam yang sama-sama cocok.\nCari makan dulu, setelah itu jalan sebentar.\nJangan bawa laptop kalau tidak perlu.",
        "2026-10-21"
    ],
    [
        "Patungan JEJAK",
        "Print · kertas · lakban",
        "Cetak Sela: minta nota dan cek jumlah lembar sebelum pulang.\nKertas display: Hyein sudah bayar duluan.\nLakban: Minji bawa dari kos.\n\nRekap di grup setelah acara. Jangan lupa ganti uang Hyein.",
        "2026-10-20"
    ],
    [
        "JEJAK / catatan caption",
        "Archive foto keseharian sekitar kampus",
        "Enam foto: warung makan, toko cetak, papan pengumuman, dan jalan pulang.\n\nHanni pilih foto dan menulis caption. Minji bikin halaman web sederhana.\nYang belum dapat izin jangan diunggah. Cetak Sela membantu mencetak display. Ambil pesanan setelah studio.\n\nPameran kecil bareng teman-teman. Konfirmasi siapa yang bantu pasang sebelum berangkat.",
        "2026-10-20"
    ]
];
const events = {
    "6": [
        "Ulang tahun Hanni"
    ],
    "19": [
        "Tes web JEJAK · 3:00 PM"
    ],
    "20": [
        "Cek proof caption · 4:00 PM"
    ],
    "21": [
        "JEJAK walkthrough · 4:30 PM",
        "SOFT LAUNCH opens · 5:00 PM"
    ],
    "22": [
        "Rekap patungan · 12:00 PM"
    ],
    "24": [
        "Jalan bareng Hanni · konfirmasi jam"
    ]
};
const searches = [
    "cara export PDF print tanpa crop tulisan",
    "web archive foto responsive di HP",
    "cetak sela jam buka",
    "kantin teras dekat studio garis",
    "prakiraan hujan bandung sore",
    "tempat sarapan dekat gerbang dagu"
];
const emails = [
    [
        "Panitia SOFT LAUNCH",
        "JEJAK: indoor venue / jadwal pasang display",
        "Halo Minji dan Hanni,\n\nDisplay JEJAK menggunakan foyer Gantara Hall. Akses ruangan mulai 16.00, pengecekan 16.30, dan pameran dibuka 17.00.\n\nMohon bawa kabel sendiri, pastikan jalur pintu tetap kosong, dan rapikan kembali area setelah acara.\n\nTerima kasih,\nPanitia SOFT LAUNCH\nInstitut Teknologi Bumi",
        "오늘"
    ],
    [
        "Cetak Sela",
        "Print caption JEJAK sudah siap",
        "Selamat pagi,\n\nCetakan pesanan Hanni sudah bisa diambil. Mohon diperiksa lagi jumlah lembar dan potongannya sebelum dibawa pulang. Nota disertakan.\n\nTerima kasih.",
        "오늘"
    ],
    [
        "Hanni",
        "JEJAK — file final untuk dipasang",
        "Min, ini link folder final ya. Layout dan caption sudah sama dengan yang dipilih kemarin.\n\nKalau ada revisi lagi, kasih tau dulu sebelum file ditimpa. Aku bawa print setelah studio.\n\nNuhun,\nHanni",
        "어제"
    ],
    [
        "Panitia SOFT LAUNCH",
        "Daftar peserta dan kebutuhan display",
        "Halo teman-teman,\n\nMohon cek nama pada catalogue dan daftar peserta. Jika ada salah tulis, balas email ini sebelum pukul 15.00.\n\nUntuk JEJAK: Hanni Pham — Desain Komunikasi Visual; Minji Kim — Teknik Informatika. Satu meja display dan satu stopkontak sudah dicatat.\n\nTerima kasih.",
        "10/20"
    ]
];
const calls = [
    [
        "Hanni",
        "어제 21:31",
        "수신"
    ],
    [
        "Danielle",
        "어제 16:02",
        "발신"
    ],
    [
        "Mom",
        "화요일 18:10",
        "수신"
    ],
    [
        "Hyein",
        "월요일 15:30",
        "부재중"
    ],
    [
        "Haerin",
        "월요일 12:08",
        "수신"
    ]
];
const mediaLabels = {};
const photoSections = [
    [
        "2026년 10월",
        [
            "yixuan.jpg",
            "photo-1.jpg",
            "photo-2.jpg",
            "campus_06.jpg",
            "life_02.jpg",
            "photo-3.jpg",
            "life_01.jpg",
            "photo-4.jpg"
        ],
        "Keseharian Bandung"
    ],
    [
        "2026년 9월",
        [
            "photo-5.jpg",
            "campus_02.jpg",
            "campus_03.jpg",
            "life_06.jpg"
        ],
        "September, mulai kenal"
    ]
];
const TODAY_CHAT = [
    [
        "min, bangun?",
        "them",
        "7:04 AM"
    ],
    [
        "Udah. Kamu jadi masuk studio jam delapan?",
        "me",
        "7:04 AM"
    ],
    [
        "jadi. lagi sarapan dulu di kos",
        "them",
        "7:05 AM"
    ],
    [
        "Aku juga mau cari bubur.",
        "me",
        "7:05 AM"
    ],
    [
        "enak. aku cuma roti wkwk",
        "them",
        "7:06 AM"
    ],
    [
        "Mau sekalian dibeliin?",
        "me",
        "7:06 AM"
    ],
    [
        "ga usah, udah kenyang. nuhun ya",
        "them",
        "7:07 AM"
    ],
    [
        "Oke. Print caption kamu ambil siang?",
        "me",
        "7:07 AM"
    ],
    [
        "iya, habis studio. yang penting file finalnya udah sama kan",
        "them",
        "7:08 AM"
    ],
    [
        "Udah. Aku tes sekali lagi sebelum kelas.",
        "me",
        "7:08 AM"
    ],
    [
        "aman. nanti kita ketemu setelah kelas selesai aja, ga usah buru-buru",
        "them",
        "7:09 AM"
    ],
    [
        "Iya. Nanti aku kabarin sebelum jalan.",
        "me",
        "7:09 AM"
    ],
    [
        "nah itu. biar aku ga nyimpenin kursi setengah jam lagi 😭",
        "them",
        "7:10 AM"
    ],
    [
        "Iya, maaf ya yang kemarin.",
        "me",
        "7:10 AM"
    ],
    [
        "udah, gapapa. yang penting sekarang bilang",
        "them",
        "7:11 AM"
    ],
    [
        "Oke, Han.",
        "me",
        "7:11 AM"
    ],
    [
        "btw yang semalem... kamu serius kan?",
        "them",
        "7:12 AM"
    ],
    [
        "Yang ngajak makan berdua? Serius.",
        "me",
        "7:12 AM"
    ],
    [
        "soalnya proyek kita hampir kelar. nanti ga ada alasan minta cek web lagi",
        "them",
        "7:13 AM"
    ],
    [
        "Ga harus ada proyek dulu buat ketemu.",
        "me",
        "7:13 AM"
    ],
    [
        "iya juga sih",
        "them",
        "7:14 AM"
    ],
    [
        "Kamu maunya gimana?",
        "me",
        "7:14 AM"
    ],
    [
        "makan siang dulu hari ini. terus kalo kamu masih mau, sabtu kita jalan",
        "them",
        "7:15 AM"
    ],
    [
        "Aku mau.",
        "me",
        "7:15 AM"
    ],
    [
        "oke. sabtu jam berapa kamu bisa?",
        "them",
        "7:16 AM"
    ]
];
const INCOMING = [
    "aku udah di depan studio. nanti kalo selesai kelas kabarin ya",
    "payungku ketinggalan di kos. semoga siang ga hujan dulu 😭"
];
const STORY_BEATS = [
    {
        "title": "Sabtu, bukan rapat",
        "options": [
            {
                "text": "Jam sepuluh bisa. Aku pengin jalan sama kamu, bukan sambil ngerjain JEJAK.",
                "reply": [
                    "aku juga penginnya gitu",
                    "yaudah, sabtu jam sepuluh ya. ketemu di gerbang dagu aja"
                ],
                "point": 1
            },
            {
                "text": "Siang aja gimana? Cari makan dulu, habis itu jalan sebentar.",
                "reply": [
                    "boleh, aku kosong setelah jam sebelas",
                    "ga harus keliling jauh-jauh kok"
                ],
                "point": 0
            }
        ],
        "next": "aku boleh tanya satu hal? ini kamu ngajaknya sebagai temen, atau...?"
    },
    {
        "title": "Bilang secukupnya",
        "options": [
            {
                "text": "Aku suka kamu, Han. Pengin kenal lebih dekat kalau kamu juga mau.",
                "reply": [
                    "oh. iya, aku mau",
                    "aku juga suka. cuma kemarin belum yakin boleh bilang atau enggak"
                ],
                "point": 1
            },
            {
                "text": "Aku pengin lebih dekat. Tapi pelan-pelan aja, ga usah langsung buru-buru.",
                "reply": [
                    "iya, pelan-pelan aja",
                    "aku nyaman kok sama kamu. makanya ngajak ketemu lagi"
                ],
                "point": 0
            }
        ],
        "next": "terus makan siang hari ini gimana? jadwal kelasmu udah pasti belum?"
    },
    {
        "title": "Janji yang bisa ditepati",
        "options": [
            {
                "text": "Selesai sekitar dua belas, tapi aku kabarin setelah beneran keluar kelas. Kamu makan duluan kalau lapar.",
                "reply": [
                    "oke. aku juga kabarin pas studio selesai",
                    "nanti cari meja bareng aja, ga usah ada yang nunggu lama"
                ],
                "point": 1
            },
            {
                "text": "Aku kabarin setelah kelas ya. Kalau waktunya ga ketemu, sore habis pasang display aja.",
                "reply": [
                    "boleh, itu lebih aman",
                    "kita makan dulu sebelum pameran buka"
                ],
                "point": 0
            }
        ],
        "next": "aku mau masuk studio dulu. boleh telepon bentar sambil jalan?"
    }
];
const ENDINGS = {
    "onair": {
        "title": "Sabtu, berdua",
        "summary": "Mereka sepakat jalan berdua Sabtu. Hari ini tetap ada kelas, makan siang, dan display yang harus dipasang.",
        "lines": [
            [
                "Hanni",
                "Halo, kedengeran?"
            ],
            [
                "Minji",
                "Kedengeran. Kamu udah di kampus?"
            ],
            [
                "Hanni",
                "Udah, depan studio. Tadi papasan sama Danielle, disuruh jangan lupa bawa print."
            ],
            [
                "Minji",
                "Iya. Aku bawa kabel sama laptop. Kamu ga usah ngangkut semuanya."
            ],
            [
                "Hanni",
                "Oke. Eh, yang Sabtu tadi... jadi ya?"
            ],
            [
                "Minji",
                "Jadi. Ketemu di Gerbang Dagu ya. Mau makan dulu atau langsung jalan?"
            ],
            [
                "Hanni",
                "Makan dulu aja. Aku ga kuat jalan kalau belum makan."
            ],
            [
                "Minji",
                "Boleh. Nanti kita pilih tempatnya."
            ],
            [
                "Hanni",
                "Aku seneng kamu bilang tadi. Aku dari kemarin mikir kita ini cuma sering ketemu karena proyek."
            ],
            [
                "Minji",
                "Aku juga seneng kamu ngajak. Aku kira kamu cuma mau bareng karena searah."
            ],
            [
                "Hanni",
                "Awalnya sih iya. Tapi kan aku bisa pulang sendiri kalau mau."
            ],
            [
                "Minji",
                "Iya juga."
            ],
            [
                "Hanni",
                "Yaudah. Aku masuk dulu, temenku udah manggil."
            ],
            [
                "Minji",
                "Oke. Nanti aku kabarin setelah kelas."
            ],
            [
                "Hanni",
                "Sip. Sampai nanti, Min."
            ],
            [
                "Minji",
                "Sampai nanti, Han."
            ]
        ]
    },
    "quiet": {
        "title": "Ketemu setelah kelas",
        "summary": "Mereka sepakat mengenal satu sama lain pelan-pelan. Janji berikutnya sederhana: kabari setelah kelas, lalu cari makan kalau waktunya cocok.",
        "lines": [
            [
                "Hanni",
                "Halo? Aku sambil jalan ke studio ya."
            ],
            [
                "Minji",
                "Iya. Udah sarapan?"
            ],
            [
                "Hanni",
                "Udah tadi, kan aku bilang roti. Kamu yang belum, jangan ketuker."
            ],
            [
                "Minji",
                "Oh iya. Ini lagi nunggu buburnya dibungkus."
            ],
            [
                "Hanni",
                "Nuhun udah ngomong jujur tadi. Aku ga pengin kita malah canggung."
            ],
            [
                "Minji",
                "Aku juga. Kita jalanin pelan-pelan aja ya."
            ],
            [
                "Hanni",
                "Iya. Aku masih mau makan siang sama kamu walaupun webnya udah jadi."
            ],
            [
                "Minji",
                "Aku juga. Nanti kalau kelas selesai aku chat."
            ],
            [
                "Hanni",
                "Kalau aku masih studio, kamu makan duluan aja. Sore kan masih ketemu."
            ],
            [
                "Minji",
                "Oke. Sabtu sesuai yang tadi ya. Kalau ada perubahan jadwal aku kabarin."
            ],
            [
                "Hanni",
                "Sip. Cari makan yang dekat dulu juga boleh."
            ],
            [
                "Minji",
                "Boleh. Aku ga harus pergi jauh kok."
            ],
            [
                "Hanni",
                "Yaudah, makan dulu sana. Aku masuk kelas."
            ],
            [
                "Minji",
                "Semangat studionya, Han."
            ],
            [
                "Hanni",
                "Semangat juga. Sampai nanti."
            ]
        ]
    }
};
const speech = ENDINGS.onair.lines;
const Hanni_AFTER = [
    [
        "Hanni",
        "Kenapa, Min?"
    ],
    [
        "Minji",
        "Cuma mau bilang aku udah selesai kelas."
    ],
    [
        "Hanni",
        "Oke. Aku beresin meja dulu, nanti ketemu di depan kantin ya."
    ]
];
const OTHER_CALLS = {
    "Mom": [
        [
            "Mom",
            "Sudah makan, Nak?"
        ],
        [
            "Minji",
            "Sudah, Bu. Nanti sore bantu pameran teman dulu."
        ],
        [
            "Mom",
            "Iya. Kalau pulang malam kabari Ibu."
        ],
        [
            "Minji",
            "Iya, nanti aku chat."
        ]
    ],
    "Danielle": [
        [
            "Danielle",
            "Min, kunci ruangan udah di aku."
        ],
        [
            "Minji",
            "Oke. Jam empat aku ke sana sama Hanni."
        ],
        [
            "Danielle",
            "Sip, nanti ketemu."
        ]
    ],
    "Haerin": [
        [
            "Haerin",
            "Adaptornya di mana?"
        ],
        [
            "Minji",
            "Kantong depan tas. Ambil aja, Rin."
        ],
        [
            "Haerin",
            "Oke, nuhun."
        ]
    ],
    "Hyein": [
        [
            "Hyein",
            "Kak, lakbannya ada?"
        ],
        [
            "Minji",
            "Ada. Nanti aku bawa ke ruangan."
        ],
        [
            "Hyein",
            "Oke, makasih Kak."
        ]
    ]
};
const CALL_BUSY = [
    "min, aku lagi asistensi. nanti aku kabarin kalau udah bisa telepon ya",
    "kalau ada yang perlu, chat dulu aja"
];
const CALL_DECLINED = [
    "lagi kelas ya? gapapa, nanti aja",
    "aku juga mau masuk studio. kabarin kalau udah senggang"
];
const DISPLAY = {
    "Jejak team": "JEJAK / final_final",
    "Exhibit desk": "SOFT LAUNCH desk",
    "Mom": "Mom",
    "Hanni": "Hanni",
    "Danielle": "Danielle",
    "Haerin": "Haerin",
    "Hyein": "Hyein"
};
const MAP_PLACES = [
    {
        "id": "home",
        "name": "Kos Tamanasri",
        "sub": "Kos · Tamanasri, Bandung",
        "x": 700,
        "y": 880,
        "color": "#5e5ce6",
        "glyph": "home",
        "fav": true,
        "info": [
            [
                "Kamar",
                "402, Gang Tamanasri"
            ],
            [
                "Sebelum berangkat",
                "Kunci, dompet, botol minum."
            ]
        ]
    },
    {
        "id": "s",
        "name": "Labtek Kode",
        "sub": "Teknik Informatika · Institut Teknologi Bumi",
        "x": 772,
        "y": 792,
        "color": "#ff375f",
        "glyph": "home",
        "fav": true,
        "info": [
            [
                "Kegiatan",
                "Kelas dan praktikum Informatika"
            ],
            [
                "Janjian",
                "Kabari setelah kelas benar-benar selesai."
            ]
        ]
    },
    {
        "id": "corner",
        "name": "Studio Garis",
        "sub": "Desain Komunikasi Visual · Studio Garis",
        "x": 650,
        "y": 430,
        "color": "#ff9f0a",
        "glyph": "bag",
        "fav": true,
        "info": [
            [
                "Kegiatan",
                "Studio DKV dan diskusi karya"
            ],
            [
                "Janjian",
                "Tunggu di depan, jangan masuk saat kelas."
            ]
        ]
    },
    {
        "id": "art",
        "name": "Gantara Hall",
        "sub": "Tempat display SOFT LAUNCH",
        "x": 300,
        "y": 340,
        "color": "#007aff",
        "glyph": "bag",
        "fav": false,
        "info": [
            [
                "Jadwal",
                "Pasang display 16.00 · buka 17.00"
            ],
            [
                "Bawaan",
                "Laptop, kabel, print caption, lakban."
            ]
        ]
    },
    {
        "id": "bus",
        "name": "Cetak Sela",
        "sub": "Toko cetak dan fotokopi",
        "x": 530,
        "y": 950,
        "color": "#34c759",
        "glyph": "bag",
        "fav": false,
        "info": [
            [
                "Pesanan",
                "Print caption JEJAK"
            ],
            [
                "Pengambilan",
                "Cek lembar dan minta nota."
            ]
        ]
    }
];
const MAP_RECENTS = [
    [
        "Studio Garis",
        "Today"
    ],
    [
        "Cetak Sela",
        "Yesterday"
    ],
    [
        "Labtek Kode",
        "October 19"
    ]
];

'use strict';