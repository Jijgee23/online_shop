# -*- coding: utf-8 -*-
"""IShop гарын авлага → MP4 видео (PIL render + procedural ambient + crossfade/zoom).

Хэрэглээ:
    python scripts/make_video.py preview   # зөвхөн фрэймүүдийг PNG болгож хадгална (QA)
    python scripts/make_video.py           # бүрэн MP4 видео үүсгэнэ
"""
import os, re, sys, math, subprocess, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

# ── Theme (RGB) ─────────────────────────────────────────────────────────────
BG       = (0x0A, 0x0A, 0x0B)
CARD     = (0x18, 0x18, 0x1B)
CARD2    = (0x27, 0x27, 0x2A)
TEAL     = (0x14, 0xB8, 0xA6)
TEAL_LT  = (0x5E, 0xEA, 0xD4)
WHITE    = (0xFA, 0xFA, 0xFA)
GREY     = (0xA1, 0xA1, 0xAA)
GREY_DK  = (0x71, 0x71, 0x7A)
AMBER    = (0xF5, 0x9E, 0x0B)
VIOLET   = (0x8B, 0x5C, 0xF6)
BLUE     = (0x3B, 0x82, 0xF6)
RED      = (0xEF, 0x44, 0x44)
GREEN    = (0x22, 0xC5, 0x5E)

def RGBColor(r, g, b):       # shim — content түвшинд RGBColor(...) дуудлагатай тул
    return (r, g, b)

class _Enum:
    pass
PP_ALIGN = _Enum(); PP_ALIGN.LEFT = "L"; PP_ALIGN.CENTER = "C"; PP_ALIGN.RIGHT = "R"
MSO_ANCHOR = _Enum(); MSO_ANCHOR.TOP = "T"; MSO_ANCHOR.MIDDLE = "M"; MSO_ANCHOR.BOTTOM = "B"
def Inches(v): return v
def Pt(v): return v

# ── Canvas / fonts ──────────────────────────────────────────────────────────
IN = 144.0                  # px per inch  → 13.333" x 7.5" = 1920 x 1080
W_PX, H_PX = 1920, 1080
SHOT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "screenshots")

F_REG  = "C:/Windows/Fonts/segoeui.ttf"
F_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
F_EMJ  = "C:/Windows/Fonts/seguiemj.ttf"
_fc, _ec, _mc = {}, {}, {}

def _font(pt, bold):
    px = max(1, round(pt * 2)); key = (px, bold)
    if key not in _fc:
        _fc[key] = ImageFont.truetype(F_BOLD if bold else F_REG, px)
    return _fc[key]

def _emoji(pt):
    px = max(1, round(pt * 2))
    if px not in _ec:
        _ec[px] = ImageFont.truetype(F_EMJ, px)
    return _ec[px]

def _metrics(pt):
    if pt not in _mc:
        _mc[pt] = _font(pt, False).getmetrics()
    return _mc[pt]

SCRATCH = ImageDraw.Draw(Image.new("RGBA", (8, 8)))

def _is_emoji(ch):
    o = ord(ch)
    return (0x1F000 <= o <= 0x1FAFF or 0x2600 <= o <= 0x27BF or
            0x2300 <= o <= 0x23FF or 0x2B00 <= o <= 0x2BFF)

def _split_emoji(s):
    out, cur, cur_e = [], "", None
    for ch in s:
        if ord(ch) in (0xFE0F, 0x200D):
            continue
        e = _is_emoji(ch)
        if cur_e is None:
            cur, cur_e = ch, e
        elif e == cur_e:
            cur += ch
        else:
            out.append((cur, cur_e)); cur, cur_e = ch, e
    if cur:
        out.append((cur, cur_e))
    return out

# ── Slide handle / collection ───────────────────────────────────────────────
# noshots → screenshot слайдуудыг бүр алгасч, зөвхөн кодоор зурагдсан слайдуудаас
# бүрдэх цэвэр танилцуулга видео үүсгэнэ.
NOSHOTS = "noshots" in sys.argv
_frames = []
_NUM = 0
def nextnum():
    global _NUM; _NUM += 1; return _NUM

class Slide:
    def __init__(self):
        self.img = Image.new("RGBA", (W_PX, H_PX), BG + (255,))
        self.draw = ImageDraw.Draw(self.img)

def slide():
    s = Slide(); _frames.append(s.img); return s

# ── Primitives ──────────────────────────────────────────────────────────────
def box(s, x, y, w, h, fill=None, line=None, line_w=1.0, radius=0.10):
    x0, y0 = x * IN, y * IN
    x1, y1 = (x + w) * IN, (y + h) * IN
    wpx, hpx = w * IN, h * IN
    r = radius * min(wpx, hpx)
    r = max(0, min(r, min(wpx, hpx) / 2 - 0.5))
    outline = line if line else None
    ow = max(1, round(line_w * 2)) if line else 0
    s.draw.rounded_rectangle([x0, y0, x1, y1], radius=r, fill=fill,
                             outline=outline, width=ow)

def _para_layout(para, max_w):
    sizes = [r[1] for r in para] or [12]
    pmax = max(sizes)
    tokens = []
    for (text, size, color, bold) in para:
        if text == "":
            continue
        fnt = _font(size, bold)
        for seg in re.split(r"(\s+)", text):
            if seg == "":
                continue
            if seg.isspace():
                tokens.append(("sp", SCRATCH.textlength(seg, font=fnt)))
            else:
                pieces = []
                for sub, ise in _split_emoji(seg):
                    f = _emoji(size) if ise else fnt
                    wd = SCRATCH.textlength(sub, font=f)
                    pieces.append((sub, f, color, ise, wd))
                tokens.append(("w", pieces, sum(p[4] for p in pieces)))
    lines, cur, cw, pend = [], [], 0.0, 0.0
    for tk in tokens:
        if tk[0] == "sp":
            if cur:
                pend += tk[1]
        else:
            ww = tk[2]
            if cur and cw + pend + ww > max_w:
                lines.append(cur); cur, cw, pend = [], 0.0, 0.0
            if cur and pend > 0:
                cur.append(("sp", pend)); cw += pend
            pend = 0.0
            cur.append(("w", tk[1], ww)); cw += ww
    if cur:
        lines.append(cur)
    if not lines:
        lines = [[]]
    return lines, pmax

def txt(s, x, y, w, h, runs, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP,
        space_after=6, line_spacing=1.0):
    X, Y, Wp, Hp = x * IN, y * IN, w * IN, h * IN
    sa = space_after * 2
    paras = []
    total = 0.0
    for para in runs:
        lines, pmax = _para_layout(para, Wp)
        asc, desc = _metrics(pmax)
        lh = (asc + desc) * line_spacing
        paras.append((lines, lh))
        total += lh * len(lines) + sa
    if runs:
        total -= sa
    if anchor == MSO_ANCHOR.MIDDLE:
        cy = Y + (Hp - total) / 2
    elif anchor == MSO_ANCHOR.BOTTOM:
        cy = Y + (Hp - total)
    else:
        cy = Y
    for (lines, lh) in paras:
        for ln in lines:
            lw = sum((seg[1] if seg[0] == "sp" else seg[2]) for seg in ln)
            if align == PP_ALIGN.CENTER:
                lx = X + (Wp - lw) / 2
            elif align == PP_ALIGN.RIGHT:
                lx = X + (Wp - lw)
            else:
                lx = X
            for seg in ln:
                if seg[0] == "sp":
                    lx += seg[1]; continue
                for (sub, f, color, ise, wp) in seg[1]:
                    s.draw.text((lx, cy), sub, font=f, fill=color,
                                anchor="la", embedded_color=ise)
                    lx += wp
            cy += lh
        cy += sa

def chip(s, x, y, label, color=TEAL):
    w = 0.34 + 0.115 * len(label)
    box(s, x, y, w, 0.42, fill=None, line=color, line_w=1.25, radius=0.5)
    txt(s, x, y - 0.02, w, 0.46, [[(label, 12, color, True)]],
        align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, space_after=0)
    return w

def header(s, kicker, title, num):
    box(s, 0.0, 0.0, 0.16, 7.5, fill=TEAL, radius=0)
    txt(s, 0.75, 0.55, 11, 0.4, [[(kicker, 13, TEAL, True)]], space_after=0)
    txt(s, 0.72, 0.92, 11.5, 1.0, [[(title, 32, WHITE, True)]], space_after=0)
    txt(s, 12.2, 0.6, 0.9, 0.5, [[(f"{num:02d}", 15, GREY_DK, True)]],
        align=PP_ALIGN.RIGHT, space_after=0)

def feature_card(s, x, y, w, h, icon, title, lines, accent=TEAL):
    box(s, x, y, w, h, fill=CARD, line=CARD2, line_w=1.0, radius=0.09)
    txt(s, x + 0.3, y + 0.25, 1.0, 0.6, [[(icon, 26, accent, False)]], space_after=0)
    txt(s, x + 0.3, y + 0.95, w - 0.6, 0.5, [[(title, 16, WHITE, True)]], space_after=0)
    body = [[(ln, 11.5, GREY, False)] for ln in lines]
    txt(s, x + 0.3, y + 1.45, w - 0.55, h - 1.6, body, space_after=5, line_spacing=1.05)

def step_card(s, x, y, w, n, title, desc, accent=TEAL):
    h = 1.18
    box(s, x, y, w, h, fill=CARD, line=CARD2, line_w=1.0, radius=0.12)
    cx = (x + 0.28 + 0.25) * IN; cy = (y + 0.34 + 0.25) * IN; rr = 0.25 * IN
    s.draw.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=accent)
    s.draw.text((cx, cy - 1), str(n), font=_font(18, True), fill=BG, anchor="mm")
    txt(s, x + 1.0, y + 0.18, w - 1.2, 0.5, [[(title, 15, WHITE, True)]], space_after=0)
    txt(s, x + 1.0, y + 0.58, w - 1.2, h - 0.6, [[(desc, 11.5, GREY, False)]],
        space_after=0, line_spacing=1.05)

def browser_frame(s, x, y, w, h):
    box(s, x, y, w, h, fill=CARD, line=CARD2, line_w=1.0, radius=0.04)
    bar_h = 0.36
    box(s, x, y, w, bar_h, fill=CARD2, radius=0.04)
    for i, c in enumerate([RED, AMBER, GREEN]):
        dx = (x + 0.22 + i * 0.2) * IN; dy = (y + 0.12) * IN; dr = 0.055 * IN
        s.draw.ellipse([dx, dy, dx + 2 * dr, dy + 2 * dr], fill=c)
    pad = 0.1
    return x + pad, y + bar_h + pad, w - 2 * pad, h - bar_h - 2 * pad

def fit_image(s, path, bx, by, bw, bh):
    im = Image.open(path).convert("RGBA")
    iw, ih = im.size
    ar = iw / ih; box_ar = bw / bh
    if ar > box_ar:
        w = bw; h = bw / ar
    else:
        h = bh; w = bh * ar
    px = round((bx + (bw - w) / 2) * IN); py = round((by + (bh - h) / 2) * IN)
    im = im.resize((max(1, round(w * IN)), max(1, round(h * IN))), Image.LANCZOS)
    s.img.paste(im, (px, py))

def placeholder(s, bx, by, bw, bh, fname):
    box(s, bx, by, bw, bh, fill=BG, line=TEAL, line_w=1.5, radius=0.03)
    txt(s, bx, by + bh / 2 - 0.75, bw, 1.5,
        [[("🖼", 34, TEAL, False)], [("Энд зураг орно", 14, GREY, False)],
         [(fname, 13, TEAL_LT, True)]],
        align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, space_after=5)

def shot_slide(kicker, title, shots):
    if NOSHOTS:          # screenshot слайдуудыг алгасна
        return None
    s = slide()
    header(s, kicker, title, nextnum())
    if len(shots) == 1:
        fname, cap = shots[0]
        fx, fy, fw, fh = 1.85, 1.95, 9.6, 4.5
        ix, iy, iw, ih = browser_frame(s, fx, fy, fw, fh)
        p = os.path.join(SHOT_DIR, fname)
        if os.path.exists(p):
            fit_image(s, p, ix, iy, iw, ih)
        else:
            placeholder(s, ix, iy, iw, ih, fname)
        txt(s, fx, fy + fh + 0.12, fw, 0.5, [[("› " + cap, 13.5, GREY, False)]],
            align=PP_ALIGN.CENTER, space_after=0)
    else:
        positions = [(0.75, 5.7), (7.0, 5.7)]
        for (fname, cap), (fx, w) in zip(shots, positions):
            fy, fh = 1.95, 4.3
            ix, iy, iw, ih = browser_frame(s, fx, fy, w, fh)
            p = os.path.join(SHOT_DIR, fname)
            if os.path.exists(p):
                fit_image(s, p, ix, iy, iw, ih)
            else:
                placeholder(s, ix, iy, iw, ih, fname)
            txt(s, fx, fy + fh + 0.12, w, 0.5, [[("› " + cap, 12.5, GREY, False)]],
                align=PP_ALIGN.CENTER, space_after=0)
    return s

# ════════════════════════════════════════════════════════════════════════════
# СЛАЙДУУДЫН АГУУЛГА  (make_guide.py-тэй ижил)
# ════════════════════════════════════════════════════════════════════════════
def build_slides():
    # 1. ГАРЧИГ
    s = slide(); nextnum()
    box(s, 9.3, -1.2, 5.5, 5.5, fill=CARD, radius=0.5)
    box(s, 10.5, 4.3, 4.5, 4.5, fill=CARD, radius=0.5)
    txt(s, 0.9, 1.5, 8, 0.5, [[("ХЭРЭГЛЭГЧИЙН ГАРЫН АВЛАГА", 15, TEAL, True)]], space_after=0)
    txt(s, 0.85, 2.05, 10, 1.6, [[("ISHOP ", 60, WHITE, True), ("платформ", 60, TEAL, True)]], space_after=0)
    txt(s, 0.9, 3.5, 9.5, 1.4,
        [[("Онлайн худалдааны систем ашиглах бүрэн заавар —", 18, GREY, False)],
         [("хэрэглэгч болон админ хэсгийн дэлгэрэнгүй гарын авлага", 18, GREY, False)]],
        space_after=4, line_spacing=1.1)
    w1 = chip(s, 0.9, 5.4, "Next.js 16")
    chip(s, 0.9 + w1 + 0.2, 5.4, "Хэрэглэгчийн заавар", TEAL_LT)
    txt(s, 0.9, 6.6, 11, 0.5, [[("IShop · Онлайн дэлгүүр · ", 12, GREY_DK, False), ("2026", 12, TEAL, True)]], space_after=0)

    # 2. АГУУЛГА
    s = slide()
    header(s, "ЕРӨНХИЙ", "Энэ гарын авлагад юу багтсан бэ?", nextnum())
    items = [
        ("01", "Системийн танилцуулга", "IShop гэж юу вэ, хэн ашиглах вэ"),
        ("02", "Бүртгэл ба нэвтрэлт", "Шинээр бүртгүүлэх, нэвтрэх, нууц үг сэргээх"),
        ("03", "Дэлгүүр хэсэг (хэрэглэгч)", "Бараа хайх, үзэх, сагсалж худалдан авах"),
        ("04", "Захиалга ба профайл", "Захиалга хянах, хаяг, хүслийн жагсаалт"),
        ("05", "Админ — Хянах самбар", "Орлого, статистик, захиалгын төлөв"),
        ("06", "Админ — Бүтээгдэхүүн", "Бараа нэмэх, засах, ангилал, онцлох"),
        ("07", "Админ — Захиалга & Санхүү", "Захиалга боловсруулах, төлбөр, тайлан"),
        ("08", "Зөвлөмж ба тусламж", "Түгээмэл асуулт, анхаарах зүйлс"),
    ]
    x0, y0, cw, ch, gx, gy = 0.75, 1.95, 5.85, 1.05, 0.3, 0.18
    for i, (n, t, d) in enumerate(items):
        x = x0 + (i % 2) * (cw + gx); y = y0 + (i // 2) * (ch + gy)
        box(s, x, y, cw, ch, fill=CARD, line=CARD2, line_w=1.0, radius=0.12)
        txt(s, x + 0.28, y + 0.16, 0.9, 0.7, [[(n, 22, TEAL, True)]], space_after=0)
        txt(s, x + 1.15, y + 0.16, cw - 1.3, 0.4, [[(t, 14.5, WHITE, True)]], space_after=0)
        txt(s, x + 1.15, y + 0.58, cw - 1.3, 0.4, [[(d, 11, GREY, False)]], space_after=0)

    # 3. ТАНИЛЦУУЛГА
    s = slide()
    header(s, "01 · ТАНИЛЦУУЛГА", "IShop гэж юу вэ?", nextnum())
    txt(s, 0.75, 1.95, 11.8, 1.0,
        [[("IShop нь онлайн худалдааны бүрэн систем юм. Хэрэглэгч бараа сонгож худалдан авдаг ", 15, GREY, False),
          ("дэлгүүр", 15, TEAL, True), (" хэсэг, дэлгүүрийг удирддаг ", 15, GREY, False),
          ("админ", 15, TEAL, True), (" хэсэг гэсэн хоёр үндсэн талтай.", 15, GREY, False)]],
        space_after=0, line_spacing=1.15)
    feature_card(s, 0.75, 3.1, 5.85, 3.7, "🛍️", "Хэрэглэгчийн хэсэг (дэлгүүр)",
                 ["• Бараа хайх, ангиллаар шүүх", "• Дэлгэрэнгүй мэдээлэл, зураг үзэх",
                  "• Сагсанд нэмж худалдан авах", "• QPay-ээр төлбөр төлөх",
                  "• Захиалгаа хянах, хаяг хадгалах", "• Хүслийн жагсаалт үүсгэх"], accent=TEAL)
    feature_card(s, 6.95, 3.1, 5.6, 3.7, "⚙️", "Админ хэсэг (удирдлага)",
                 ["• Хянах самбар, статистик", "• Бараа, ангилал нэмэх/засах",
                  "• Захиалга боловсруулах", "• Харилцагчдыг удирдах",
                  "• Төлбөр, нэхэмжлэл, тайлан", "• Мэдэгдэл, тохиргоо"], accent=VIOLET)

    # 4. БҮРТГЭЛ
    s = slide()
    header(s, "02 · ЭХЛЭЛ", "Бүртгүүлэх ба нэвтрэх", nextnum())
    step_card(s, 0.75, 1.95, 5.85, 1, "Бүртгүүлэх", "Нүүр хуудаснаас «Бүртгүүлэх» сонгож, нэр, и-мэйл, нууц үгээ оруулна.")
    step_card(s, 0.75, 3.31, 5.85, 2, "Нэвтрэх", "И-мэйл, нууц үгээрээ нэвтэрнэ. Амжилттай бол шууд дэлгүүр рүү орно.")
    step_card(s, 0.75, 4.67, 5.85, 3, "Нууц үг сэргээх", "Мартсан бол «Нууц үг сэргээх»-ээр и-мэйлээр код авч шинэчилнэ.")
    box(s, 6.95, 1.95, 5.6, 4.85, fill=CARD, line=CARD2, line_w=1.0, radius=0.07)
    txt(s, 7.3, 2.25, 5, 0.5, [[("💡 Анхаарах", 16, TEAL, True)]], space_after=0)
    txt(s, 7.3, 2.85, 4.95, 3.8,
        [[("• И-мэйл хаяг зөв, идэвхтэй байх ёстой — баталгаажуулалт, мэдэгдэл ирнэ.", 12.5, GREY, False)],
         [("• Нууц үгээ найдвартай (8+ тэмдэгт) сонгоно.", 12.5, GREY, False)],
         [("• Нэг бүртгэлээр олон төхөөрөмжөөс нэвтэрч болно («Төхөөрөмжүүд» хэсэг).", 12.5, GREY, False)],
         [("• Админ эрхтэй бол нэвтрэхэд автоматаар админ хэсэг рүү шилжинэ.", 12.5, GREY, False)]],
        space_after=10, line_spacing=1.1)
    shot_slide("02 · ЭХЛЭЛ", "Нэвтрэх / бүртгүүлэх дэлгэц", [("login.png", "Нэвтрэх ба бүртгүүлэх хуудас")])

    # 5. ХАЙХ ҮЗЭХ
    s = slide()
    header(s, "03 · ХЭРЭГЛЭГЧ", "Бараа хайх ба үзэх", nextnum())
    feature_card(s, 0.75, 1.95, 3.75, 4.85, "🏠", "Нүүр хуудас",
                 ["Онцлох бараа, шилдэг", "ангилал, статистик", "харагдана.", "",
                  "Дээд хэсгийн хайлтын", "талбараас нэр, тайлбар,", "ангиллаар хайна."])
    feature_card(s, 4.75, 1.95, 3.75, 4.85, "🔍", "Хайх & шүүх",
                 ["Ангиллаар шүүж, нэрээр", "хайж барааг хурдан", "олно.", "",
                  "Үр дүн шууд шинэчлэгдэж", "тохирох бараанууд", "жагсаалтаар гарна."], accent=BLUE)
    feature_card(s, 8.75, 1.95, 3.8, 4.85, "📄", "Дэлгэрэнгүй",
                 ["Барааны зураг, үнэ,", "тайлбар, нөөцийг", "харна.", "",
                  "Тоо ширхэг сонгож", "«Сагсанд нэмэх» эсвэл", "хүслийн жагсаалтад нэмнэ."], accent=AMBER)
    shot_slide("03 · ХЭРЭГЛЭГЧ", "Дэлгүүрийн дэлгэцүүд",
               [("user_products.png", "Дэлгүүр — барааны жагсаалт, хайлт"),
                ("product_details.png", "Барааны дэлгэрэнгүй хуудас")])

    # ХУВИЛБАР СОНГОХ (шинэ дэлгэрэнгүй)
    s = slide()
    header(s, "03 · ХЭРЭГЛЭГЧ", "Хувилбартай бараа сонгох", nextnum())
    feature_card(s, 0.75, 1.95, 3.75, 4.85, "🎨", "Өнгө / хэмжээ",
                 ["Нэг бараа олон өнгө,", "хэмжээ, материал,", "загвартай байж болно.",
                  "", "Товчлуураар хүссэн", "хувилбараа сонгоно."], accent=TEAL)
    feature_card(s, 4.75, 1.95, 3.75, 4.85, "📦", "Бодит нөөц & үнэ",
                 ["Сонгосон хослолын нөөц,", "үнэ шууд шинэчлэгдэнэ.",
                  "", "Боломжгүй хослолыг", "автоматаар тохирох", "хувилбар руу тааруулна."], accent=BLUE)
    feature_card(s, 8.75, 1.95, 3.8, 4.85, "✨", "Онцлог шинж",
                 ["WiFi, Bluetooth, Type-C", "зэрэг нэмэлт шинжийг", "доор харуулна.",
                  "", "Сонгоод «Сагсанд", "нэмэх» дарна."], accent=AMBER)
    shot_slide("03 · ХЭРЭГЛЭГЧ", "Барааны дэлгэрэнгүй — хувилбар сонгох",
               [("product_details_new_user.png", "Өнгө, хэмжээ, материал сонгоход нөөц, үнэ шинэчлэгдэнэ")])

    # 6. САГС
    s = slide()
    header(s, "03 · ХЭРЭГЛЭГЧ", "Сагс ба худалдан авалт", nextnum())
    steps = [("Сагсанд нэмэх", "Барааг тоо ширхэгтэйгээр сагсанд нэмнэ."),
             ("Сагс шалгах", "Сагсан дахь бараа, тоо, нийт дүнг хянана."),
             ("Хаяг сонгох", "Хүргэлтийн хаягаа оруулах буюу сонгоно."),
             ("Төлбөр төлөх", "QPay-ээр төлбөрөө төлж захиалгаа баталгаажуулна.")]
    for i, (t, d) in enumerate(steps):
        step_card(s, 0.75, 1.95 + i * 1.25, 7.0, i + 1, t, d)
    box(s, 8.1, 1.95, 4.45, 4.85, fill=CARD, line=TEAL, line_w=1.25, radius=0.07)
    txt(s, 8.45, 2.25, 3.8, 0.5, [[("🧾 Төлбөрийн урсгал", 15, TEAL, True)]], space_after=0)
    txt(s, 8.45, 2.95, 3.8, 3.7,
        [[("Худалдан авалт 4 алхамтай: сагс → хаяг → төлбөр → баталгаажуулалт.", 12.5, GREY, False)],
         [("QPay-ийн QR кодыг банкны аппаар уншуулж төлнө.", 12.5, GREY, False)],
         [("Төлбөр амжилттай бол захиалга «Хүлээгдэж буй» төлөвт орж, админд мэдэгдэнэ.", 12.5, GREY, False)]],
        space_after=12, line_spacing=1.12)
    shot_slide("03 · ХЭРЭГЛЭГЧ", "Сагс ба хаяг сонгох",
               [("cart.png", "Сагс — бараа, тоо, нийт дүн"),
                ("address_pick_step.png", "Хүргэлтийн хаяг сонгох алхам")])
    shot_slide("03 · ХЭРЭГЛЭГЧ", "Төлбөр төлөх алхам",
               [("payment_method_step.png", "Төлбөрийн хэлбэр сонгох"),
                ("qpay_step.png", "QPay QR кодоор төлөх")])

    # 7. ЗАХИАЛГА БА ПРОФАЙЛ
    s = slide()
    header(s, "04 · ХЭРЭГЛЭГЧ", "Захиалга & хувийн мэдээлэл", nextnum())
    cards = [
        ("📦", "Захиалгууд", ["Захиалгын түүх,", "төлөв, дэлгэрэнгүйг", "хянана."], TEAL),
        ("❤️", "Хүслийн жагсаалт", ["Дараа авах барааг", "хадгалж, шууд сагсанд", "шилжүүлнэ."], RGBColor(0xF4, 0x3F, 0x5E)),
        ("📍", "Хаяг", ["Хүргэлтийн хаягаа", "хадгалж, газрын зураг", "дээр тэмдэглэнэ."], BLUE),
        ("🔔", "Мэдэгдэл", ["Захиалга, урамшууллын", "мэдэгдлийг хүлээн", "авна."], AMBER),
        ("👤", "Профайл", ["Нэр, зураг, мэдээллээ", "засварлана."], VIOLET),
        ("⚙️", "Тохиргоо", ["Нууц үг, төхөөрөмж,", "хэл, харагдацыг", "тохируулна."], TEAL_LT),
    ]
    x0, y0, cw, ch, gx, gy = 0.75, 1.95, 3.75, 2.3, 0.18, 0.2
    for i, (ic, t, lines, ac) in enumerate(cards):
        feature_card(s, x0 + (i % 3) * (cw + gx), y0 + (i // 3) * (ch + gy), cw, ch, ic, t, lines, accent=ac)
    shot_slide("04 · ХЭРЭГЛЭГЧ", "Захиалгын түүх ба дэлгэрэнгүй",
               [("user_orders.png", "Миний захиалгууд"),
                ("user_order_detail.png", "Захиалгын дэлгэрэнгүй")])

    # САЛБАРУУД (хэрэглэгч)
    s = slide()
    header(s, "04 · ХЭРЭГЛЭГЧ", "Салбар, байршлууд", nextnum())
    txt(s, 0.75, 1.9, 11.8, 0.7,
        [[("Дэлгүүрийн салбаруудыг ", 14, GREY, False), ("«Салбарууд»", 14, TEAL, True),
          (" хуудаснаас үзнэ. Дээд талын товчоор ", 14, GREY, False),
          ("жагсаалт", 14, TEAL, True), (" эсвэл ", 14, GREY, False),
          ("газрын зураг", 14, TEAL, True), (" хэлбэрээр сэлгэнэ.", 14, GREY, False)]],
        space_after=0, line_spacing=1.12)
    feature_card(s, 0.75, 2.95, 5.85, 3.85, "📋", "Жагсаалт хэлбэр",
                 ["Салбар бүрийн нэр, хаяг,", "утсыг карт хэлбэрээр", "харна.",
                  "", "«Газрын зураг дээр харах»-аар", "тухайн салбарын байршлыг", "шууд нээнэ."], accent=TEAL)
    feature_card(s, 6.95, 2.95, 5.6, 3.85, "🗺️", "Газрын зураг хэлбэр",
                 ["Бүх салбарыг Google", "газрын зураг дээр пин", "болгон харуулна.",
                  "", "Пин дээр дарж нэр, хаяг,", "утсыг шууд харна."], accent=BLUE)
    shot_slide("04 · ХЭРЭГЛЭГЧ", "Салбарууд — жагсаалт ба газрын зураг",
               [("user_see_branches_card_mode.png", "Жагсаалт хэлбэр — салбарын картууд"),
                ("user_see_branches_map_mode.png", "Газрын зураг хэлбэр — Google Maps пин")])

    # 8. DASHBOARD
    s = slide()
    header(s, "05 · АДМИН", "Хянах самбар (Dashboard)", nextnum())
    txt(s, 0.75, 1.9, 11.8, 0.6,
        [[("Админ эрхээр нэвтрэхэд ", 14, GREY, False), ("ISHOP ADMIN", 14, TEAL, True),
          (" удирдлагын самбар нээгдэнэ. Зүүн талын цэснээс бүх хэсэгт шилжинэ.", 14, GREY, False)]],
        space_after=0, line_spacing=1.1)
    stats = [("💰", "Нийт орлого", TEAL), ("📦", "Нийт захиалга", BLUE),
             ("👥", "Хэрэглэгчид", VIOLET), ("🏬", "Нийт бараа", AMBER)]
    for i, (ic, t, ac) in enumerate(stats):
        x = 0.75 + i * 3.02
        box(s, x, 2.75, 2.82, 1.5, fill=CARD, line=CARD2, line_w=1.0, radius=0.14)
        txt(s, x + 0.28, 2.95, 1, 0.6, [[(ic, 24, ac, False)]], space_after=0)
        txt(s, x + 0.28, 3.65, 2.4, 0.5, [[(t, 13, WHITE, True)]], space_after=0)
    box(s, 0.75, 4.5, 7.4, 2.3, fill=CARD, line=CARD2, line_w=1.0, radius=0.08)
    txt(s, 1.1, 4.75, 6.6, 0.5, [[("📊 Самбарт харагдах зүйлс", 15, TEAL, True)]], space_after=0)
    txt(s, 1.1, 5.35, 6.7, 1.4,
        [[("• Орлогын график (огноогоор шүүж болно)", 12.5, GREY, False)],
         [("• Захиалгын төлөв (хүлээгдэж буй / хүргэгдсэн)", 12.5, GREY, False)],
         [("• Шилдэг борлуулалттай бараа ба сүүлийн захиалгууд", 12.5, GREY, False)]],
        space_after=8, line_spacing=1.1)
    box(s, 8.4, 4.5, 4.15, 2.3, fill=CARD, line=AMBER, line_w=1.25, radius=0.08)
    txt(s, 8.75, 4.75, 3.5, 0.5, [[("⏳ Хурдан анхаарал", 15, AMBER, True)]], space_after=0)
    txt(s, 8.75, 5.35, 3.5, 1.4,
        [[("Хүлээгдэж буй захиалга байвал шар сэрэмжлүүлэг гарч, дарахад шууд «Захиалгууд» руу шилжинэ.", 12.5, GREY, False)]],
        space_after=0, line_spacing=1.12)
    shot_slide("05 · АДМИН", "Админ хянах самбар", [("admin_dashboard.png", "Хянах самбар — статистик ба график")])

    # 9. БҮТЭЭГДЭХҮҮН
    s = slide()
    header(s, "06 · АДМИН", "Бүтээгдэхүүний удирдлага", nextnum())
    cards = [
        ("📋", "Жагсаалт", ["Бүх барааг харах,", "хайх, засах, устгах."], TEAL),
        ("➕", "Шинэ нэмэх", ["Нэр, үнэ, нөөц,", "зураг, ангилал оруулж", "шинэ бараа үүсгэх."], BLUE),
        ("⭐", "Онцлох", ["Нүүр хуудсанд гарах", "онцлох барааг сонгох."], AMBER),
        ("🗂️", "Ангилал", ["Барааны ангилал нэмэх,", "зураг тохируулах,", "засварлах."], VIOLET),
    ]
    x0, cw, gx = 0.75, 2.85, 0.13
    for i, (ic, t, lines, ac) in enumerate(cards):
        feature_card(s, x0 + i * (cw + gx), 2.05, cw, 3.4, ic, t, lines, accent=ac)
    box(s, 0.75, 5.7, 11.8, 1.1, fill=CARD, line=TEAL, line_w=1.25, radius=0.1)
    txt(s, 1.1, 5.92, 11.2, 0.7,
        [[("💡 Зөвлөмж:  ", 13, TEAL, True),
          ("Шинэ бараа нэмэхдээ чанартай зураг, тодорхой тайлбар, зөв ангилал, бодит нөөцийн тоог оруулаарай — энэ нь хэрэглэгчид олж, итгэхэд тусална.", 12.5, GREY, False)]],
        space_after=0, anchor=MSO_ANCHOR.MIDDLE, line_spacing=1.1)
    shot_slide("06 · АДМИН", "Бүтээгдэхүүн ба ангилал",
               [("admin_products.png", "Барааны жагсаалт"),
                ("admin_categories.png", "Ангиллын удирдлага")])

    # ХУВИЛБАРТАЙ БАРАА ҮҮСГЭХ (админ)
    s = slide()
    header(s, "06 · АДМИН", "Хувилбартай бараа (өнгө, хэмжээ)", nextnum())
    step_card(s, 0.75, 1.95, 11.8, 1, "Шинж чанар тодорхойлох",
              "Өнгө, хэмжээ, загвар, материал бүрийн утгуудыг нэмнэ (ж: Улаан, XL, Cotton).")
    step_card(s, 0.75, 3.31, 11.8, 2, "Хувилбар (хослол) үүсгэх",
              "Утгуудыг хослуулан хувилбар нэмж, тус бүрийн нөөц, үнэ, хямдрал, SKU-г оруулна.")
    step_card(s, 0.75, 4.67, 11.8, 3, "Онцлог шинж нэмэх",
              "WiFi, Bluetooth, Type-C зэрэг нэмэлт шинжийг жагсаалтаар оруулна.")
    box(s, 0.75, 6.05, 11.8, 0.8, fill=CARD, line=TEAL, line_w=1.25, radius=0.13)
    txt(s, 1.1, 6.18, 11.2, 0.6,
        [[("💡 ", 12.5, TEAL, True),
          ("Хувилбарын үнэ хоосон бол барааны нийт үнэ хэрэглэгдэнэ. Нөөц 0 бол тухайн хослол хэрэглэгчид сонгогдохгүй.", 12.5, GREY, False)]],
        space_after=0, anchor=MSO_ANCHOR.MIDDLE)
    shot_slide("06 · АДМИН", "Хувилбар тодорхойлох ба нөөц/үнэ",
               [("product_variants.png", "Шинж чанар, утгууд тодорхойлох"),
                ("product_variant_and_stock.png", "Хувилбар бүрийн нөөц, үнэ, онцлог шинж")])

    # 10. ЗАХИАЛГА & САНХҮҮ
    s = slide()
    header(s, "07 · АДМИН", "Захиалга & санхүү", nextnum())
    feature_card(s, 0.75, 1.95, 3.75, 4.85, "🛒", "Захиалгууд",
                 ["Ирсэн захиалгыг харах,", "дэлгэрэнгүй нээх,", "төлөв шинэчлэх",
                  "(боловсруулах →", "хүргэх → дуусгах).", "", "Хэрэглэгчид автоматаар", "мэдэгдэл очно."], accent=TEAL)
    feature_card(s, 4.75, 1.95, 3.75, 4.85, "💳", "Төлбөр & Invoice",
                 ["«Төлбөрүүд» — бүх", "гүйлгээг хянана.", "",
                  "«QPay Invoice» —", "нэхэмжлэлийн төлөв,", "QR кодыг шалгана."], accent=BLUE)
    feature_card(s, 8.75, 1.95, 3.8, 4.85, "📈", "Тайлан",
                 ["Борлуулалт, орлогын", "тайланг хугацаагаар", "гаргана.", "",
                  "Excel рүү экспортлож", "хадгалах боломжтой", "(.xlsx)."], accent=AMBER)
    shot_slide("07 · АДМИН", "Захиалга ба тайлан",
               [("admin_orders.png", "Захиалгын удирдлага"),
                ("admin_report.png", "Санхүүгийн тайлан")])

    # 11. ХАРИЛЦАГЧ · ТОХИРГОО · МЭДЭГДЭЛ
    s = slide()
    header(s, "07 · АДМИН", "Харилцагч · Тохиргоо · Мэдэгдэл", nextnum())
    cards = [
        ("👥", "Харилцагчид", ["Бүртгэлтэй хэрэглэгчдийн", "жагсаалт, захиалгын", "түүх, дэлгэрэнгүйг үзэх."], VIOLET),
        ("🔔", "Мэдэгдэл", ["Шинэ захиалга, үйл", "явдлын мэдэгдлийг", "хүлээн авах, хянах."], AMBER),
        ("⚙️", "Тохиргоо", ["Дэлгүүрийн мэдээлэл,", "админ профайл, системийн", "тохиргоог удирдах."], TEAL),
    ]
    x0, cw, gx = 0.75, 3.85, 0.13
    for i, (ic, t, lines, ac) in enumerate(cards):
        feature_card(s, x0 + i * (cw + gx), 2.05, cw, 3.6, ic, t, lines, accent=ac)
    box(s, 0.75, 5.95, 11.8, 0.85, fill=CARD, line=CARD2, line_w=1.0, radius=0.13)
    txt(s, 1.1, 6.1, 11.2, 0.6,
        [[("Цэс:  ", 12.5, GREY_DK, True),
          ("Хянах самбар · Захиалгууд · Бүтээгдэхүүн · Харилцагчид · Санхүү · Тохиргоо · Мэдэгдэл", 12.5, GREY, False)]],
        space_after=0, anchor=MSO_ANCHOR.MIDDLE)
    shot_slide("07 · АДМИН", "Харилцагчид ба тохиргоо",
               [("admin_users.png", "Харилцагчдын жагсаалт"),
                ("admin_settings.png", "Системийн тохиргоо")])

    # САЛБАРЫН ТОХИРГОО (админ)
    s = slide()
    header(s, "07 · АДМИН", "Салбарын удирдлага", nextnum())
    feature_card(s, 0.75, 1.95, 5.85, 3.0, "🏬", "Салбар бүртгэх",
                 ["Шинэ салбар нэмж, нэр,", "утас, хаяг (хот/дүүрэг/", "хороо) оруулна.",
                  "Газрын зураг дээр", "байршлыг тэмдэглэнэ."], accent=TEAL)
    feature_card(s, 6.95, 1.95, 5.6, 3.0, "👁️", "Харуулах эсэх",
                 ["«Салбаруудыг нийтэд", "харуулах» тохиргоогоор", "хэрэглэгчид харагдахыг",
                  "удирдана. Салбар бүрийг", "идэвхтэй/идэвхгүй болгоно."], accent=VIOLET)
    shot_slide("07 · АДМИН", "Салбарын тохиргоо",
               [("branch_settings_admin.png", "Салбар нэмэх/засах · «Салбаруудыг нийтэд харуулах» тохиргоо")])

    # 12. FAQ
    s = slide()
    header(s, "08 · ТУСЛАМЖ", "Зөвлөмж ба түгээмэл асуултууд", nextnum())
    faqs = [
        ("Нэвтэрч чадахгүй байна?", "И-мэйл, нууц үгээ шалгаад «Нууц үг сэргээх»-ийг ашиглана."),
        ("Төлбөр төлсөн ч баталгаажихгүй?", "Хэдэн секунд хүлээгээд «Захиалгууд» хэсгээс төлөвөө шалгана."),
        ("Барааны нөөц харагдахгүй?", "Админ нөөцийн тоог зөв оруулсан эсэхийг шалгана."),
        ("Хүргэлтийн хаяг буруу?", "«Хаяг» хэсгээс засаж, газрын зураг дээр дахин тэмдэглэнэ."),
        ("Админ эрх авах?", "Системийн администратороор дамжуулан эрхээ тохируулна."),
        ("Тайлан гаргах?", "Админ → Санхүү → Тайлан, огноогоор шүүж Excel татна."),
    ]
    x0, y0, cw, ch, gx, gy = 0.75, 1.95, 5.85, 1.45, 0.3, 0.18
    for i, (q, a) in enumerate(faqs):
        x = x0 + (i % 2) * (cw + gx); y = y0 + (i // 2) * (ch + gy)
        box(s, x, y, cw, ch, fill=CARD, line=CARD2, line_w=1.0, radius=0.1)
        txt(s, x + 0.3, y + 0.18, cw - 0.6, 0.5, [[("❔ " + q, 13.5, TEAL_LT, True)]], space_after=0)
        txt(s, x + 0.3, y + 0.66, cw - 0.55, 0.7, [[(a, 11.5, GREY, False)]], space_after=0, line_spacing=1.05)

    # 13. ТӨГСГӨЛ
    s = slide()
    header(s, "", "", nextnum())
    box(s, 9.3, -1.2, 5.5, 5.5, fill=CARD, radius=0.5)
    box(s, 10.5, 4.3, 4.5, 4.5, fill=CARD, radius=0.5)
    txt(s, 0.9, 2.4, 10, 0.5, [[("АМЖИЛТ ХҮСЬЕ!", 15, TEAL, True)]], space_after=0)
    txt(s, 0.85, 2.95, 11, 1.2, [[("IShop-оо хялбар ашиглаарай", 44, WHITE, True)]], space_after=0)
    txt(s, 0.9, 4.3, 10.5, 1.0,
        [[("Энэ гарын авлага хэрэглэгч болон админ хэсгийн үндсэн үйлдлүүдийг хамарлаа.", 16, GREY, False)],
         [("Нэмэлт асуулт байвал системийн администратортой холбогдоно уу.", 16, GREY, False)]],
        space_after=4, line_spacing=1.15)
    chip(s, 0.9, 5.9, "IShop · 2026", TEAL)


# ════════════════════════════════════════════════════════════════════════════
# ВИДЕО + ХӨГЖИМ
# ════════════════════════════════════════════════════════════════════════════
FPS = 30
HOLD = 4.0          # сек/слайд
HOLD_EDGE = 5.0     # эхний/сүүлийн слайд
TRANS = 0.6         # crossfade (сек)
ZOOM = 0.035        # Ken Burns зум

def _zoom(arr, sc):
    if sc <= 1.0001:
        return arr
    nw, nh = round(W_PX * sc), round(H_PX * sc)
    im = Image.fromarray(arr).resize((nw, nh), Image.LANCZOS)
    x = (nw - W_PX) // 2; y = (nh - H_PX) // 2
    return np.asarray(im.crop((x, y, x + W_PX, y + H_PX)))

def _ease(t):
    return t * t * (3 - 2 * t)

def make_music(path, dur, sr=44100):
    n = int(dur * sr)
    t = np.arange(n) / sr
    prog = [[220.00, 261.63, 329.63, 392.00],
            [174.61, 220.00, 261.63, 349.23],
            [196.00, 261.63, 329.63, 392.00],
            [196.00, 246.94, 293.66, 392.00]]
    seg = 4.0
    L = np.zeros(n); R = np.zeros(n)
    for i in range(int(math.ceil(dur / seg))):
        ch = prog[i % len(prog)]
        a = int(i * seg * sr); b = min(n, int((i + 1) * seg * sr))
        if a >= b:
            break
        tt = (np.arange(b - a)) / sr
        env = np.clip(np.minimum(tt / 0.9, 1) * np.minimum((seg - tt) / 0.9, 1), 0, 1)
        blk = np.zeros(b - a)
        for k, f in enumerate(ch):
            amp = 0.5 / (k + 1)
            blk += amp * np.sin(2 * np.pi * f * tt)
            blk += 0.12 * amp * np.sin(2 * np.pi * 2 * f * tt)
        blk *= env
        L[a:b] += blk; R[a:b] += blk * 0.97
    lfo = 0.85 + 0.15 * np.sin(2 * np.pi * 0.08 * t)
    L *= lfo; R *= lfo
    m = max(np.max(np.abs(L)), np.max(np.abs(R)), 1e-6)
    L = L / m * 0.22; R = R / m * 0.22
    fl = int(1.5 * sr)
    fade = np.ones(n)
    if n > 2 * fl:
        fade[:fl] = np.linspace(0, 1, fl); fade[-fl:] = np.linspace(1, 0, fl)
    L *= fade; R *= fade
    data = (np.stack([L, R], axis=1) * 32767).astype("<i2")
    w = wave.open(path, "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes(data.tobytes()); w.close()

def main():
    import imageio.v2 as imageio
    import imageio_ffmpeg

    build_slides()
    bases = [np.asarray(im.convert("RGB")) for im in _frames]
    nslides = len(bases)
    print(f"Slides rendered: {nslides}")

    out_dir = os.path.dirname(SHOT_DIR)

    if "preview" in sys.argv:
        pdir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_frames")
        os.makedirs(pdir, exist_ok=True)
        for i, arr in enumerate(bases, 1):
            Image.fromarray(arr).save(os.path.join(pdir, f"slide_{i:02d}.png"))
        print("Preview frames →", pdir)
        return

    tmp = os.path.join(out_dir, "_guide_video_noaudio.mp4")
    wav = os.path.join(out_dir, "_guide_music.wav")
    out = os.path.join(out_dir, "IShop_гарын_авлага.mp4")

    writer = imageio.get_writer(tmp, fps=FPS, codec="libx264", macro_block_size=8,
                                ffmpeg_params=["-crf", "18", "-pix_fmt", "yuv420p", "-preset", "medium"])
    total_frames = 0
    for i, base in enumerate(bases):
        hold = HOLD_EDGE if (i == 0 or i == nslides - 1) else HOLD
        hn = int(hold * FPS)
        for f in range(hn):
            t = f / max(1, hn - 1)
            writer.append_data(_zoom(base, 1.0 + ZOOM * t))
            total_frames += 1
        if i < nslides - 1:
            endA = _zoom(base, 1.0 + ZOOM)
            startB = _zoom(bases[i + 1], 1.0)
            tn = int(TRANS * FPS)
            for f in range(tn):
                a = _ease(f / max(1, tn - 1))
                blended = (endA.astype(np.float32) * (1 - a) + startB.astype(np.float32) * a).astype(np.uint8)
                writer.append_data(blended)
                total_frames += 1
        print(f"  slide {i+1}/{nslides} encoded")
    writer.close()

    dur = total_frames / FPS
    print(f"Video frames: {total_frames}  ({dur:.1f}s).  Generating music…")
    make_music(wav, dur + 0.5)

    ff = imageio_ffmpeg.get_ffmpeg_exe()
    subprocess.run([ff, "-y", "-i", tmp, "-i", wav, "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "160k", "-shortest", out],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    os.remove(tmp); os.remove(wav)
    print("DONE →", out)

if __name__ == "__main__":
    main()
