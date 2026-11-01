# ============================================================================
# AP VidyaConnect — System Architecture Diagram Generator (High-Res 2x PNG)
# Generates a publication-grade architecture diagram matching the visual style.
# ============================================================================

import os
from PIL import Image, ImageDraw, ImageFont

def create_architecture_diagram():
    WIDTH = 1320
    HEIGHT = 1380
    BG_COLOR = (255, 255, 255)

    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Load Windows System Fonts
    font_bold_path = "C:\\Windows\\Fonts\\segoeuib.ttf"
    font_regular_path = "C:\\Windows\\Fonts\\segoeui.ttf"

    def get_font(path, size):
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            return ImageFont.load_default()

    FONT_HEADER_TAG = get_font(font_bold_path, 13)
    FONT_HEADER_MAIN = get_font(font_bold_path, 22)
    FONT_TITLE_CARD = get_font(font_bold_path, 21)
    FONT_SUB_CARD = get_font(font_regular_path, 14)
    FONT_BRANCH = get_font(font_bold_path, 14)

    # Color Palette matching the user's reference diagram
    COLOR_NAVY_BG = (17, 34, 46)        # #11222E Dark Navy header/footer
    COLOR_NAVY_BORDER = (25, 48, 64)
    COLOR_TEXT_WHITE = (255, 255, 255)
    COLOR_TEXT_MUTED_WHITE = (205, 220, 230)

    COLOR_TEAL_BG = (235, 245, 245)      # #EBF5F5 Light cyan/teal fill
    COLOR_TEAL_BORDER = (47, 122, 130)   # #2F7A82 Teal border
    COLOR_TEAL_TITLE = (11, 46, 51)      # #0B2E33 Dark teal title
    COLOR_TEAL_SUB = (52, 92, 100)

    COLOR_ORANGE_BG = (255, 164, 57)     # #FFA439 Vibrant Orange
    COLOR_ORANGE_BORDER = (217, 119, 6)  # #D97706
    COLOR_ORANGE_TEXT = (10, 10, 10)
    COLOR_ORANGE_SUB = (35, 35, 35)

    COLOR_ARROW = (47, 122, 130)

    def draw_card(box, fill, border, title, sub_lines, title_font=FONT_TITLE_CARD, sub_font=FONT_SUB_CARD, text_color=None, sub_color=None, radius=14):
        x0, y0, x1, y1 = box
        draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill, outline=border, width=2)
        
        w = x1 - x0
        h = y1 - y0

        # Calculate text heights
        t_box = draw.textbbox((0, 0), title, font=title_font)
        t_w = t_box[2] - t_box[0]
        t_h = t_box[3] - t_box[1]

        if isinstance(sub_lines, str):
            sub_lines_list = sub_lines.split("\n")
        else:
            sub_lines_list = sub_lines

        line_metrics = []
        total_sub_h = 0
        for line in sub_lines_list:
            s_box = draw.textbbox((0, 0), line, font=sub_font)
            lw = s_box[2] - s_box[0]
            lh = s_box[3] - s_box[1]
            line_metrics.append((lw, lh, line))
            total_sub_h += lh + 4

        total_text_h = t_h + 8 + total_sub_h - 4
        start_y = y0 + (h - total_text_h) / 2

        t_x = x0 + (w - t_w) / 2
        t_col = text_color if text_color else (255, 255, 255)
        s_col = sub_color if sub_color else (200, 200, 200)

        draw.text((t_x, start_y), title, font=title_font, fill=t_col)

        curr_sub_y = start_y + t_h + 8
        for lw, lh, line in line_metrics:
            lx = x0 + (w - lw) / 2
            draw.text((lx, curr_sub_y), line, font=sub_font, fill=s_col)
            curr_sub_y += lh + 4

    def draw_arrow(start_point, end_point, color=COLOR_ARROW, width=3):
        x1, y1 = start_point
        x2, y2 = end_point
        draw.line([x1, y1, x2, y2], fill=color, width=width)
        head_size = 8
        draw.polygon([
            (x2, y2),
            (x2 - head_size, y2 - head_size * 1.3),
            (x2 + head_size, y2 - head_size * 1.3)
        ], fill=color)

    # -------------------------------------------------------------------------
    # Header Ribbon
    # -------------------------------------------------------------------------
    tag_text = "GOVERNMENT OF ANDHRA PRADESH · DEPARTMENT OF HIGHER EDUCATION"
    tag_box = draw.textbbox((0, 0), tag_text, font=FONT_HEADER_TAG)
    draw.text(((WIDTH - (tag_box[2] - tag_box[0])) // 2, 22), tag_text, font=FONT_HEADER_TAG, fill=COLOR_ARROW)

    main_title = "AP VIDYACONNECT — END-TO-END SYSTEM ARCHITECTURE"
    main_box = draw.textbbox((0, 0), main_title, font=FONT_HEADER_MAIN)
    draw.text(((WIDTH - (main_box[2] - main_box[0])) // 2, 45), main_title, font=FONT_HEADER_MAIN, fill=COLOR_NAVY_BG)

    # -------------------------------------------------------------------------
    # Geometry & Node Coordinates
    # -------------------------------------------------------------------------
    CX = WIDTH // 2  # 660
    CARD_W = 740
    H = 80
    GAP = 36

    curr_y = 86

    # 1. Top Card: Stakeholders (Dark Navy)
    box1 = (CX - CARD_W // 2, curr_y, CX + CARD_W // 2, curr_y + H + 6)
    draw_card(
        box1, COLOR_NAVY_BG, COLOR_NAVY_BORDER,
        "AP VidyaConnect Stakeholders",
        "Students · Faculty Guides · Institutional Admins · Corporate Partners · State Super Admin",
        title_font=get_font(font_bold_path, 22),
        sub_font=FONT_SUB_CARD,
        text_color=COLOR_TEXT_WHITE,
        sub_color=COLOR_TEXT_MUTED_WHITE
    )

    # Arrow 1 -> 2
    draw_arrow((CX, box1[3]), (CX, box1[3] + GAP))
    curr_y = box1[3] + GAP

    # 2. Client Application Layer
    box2 = (CX - CARD_W // 2, curr_y, CX + CARD_W // 2, curr_y + H)
    draw_card(
        box2, COLOR_TEAL_BG, COLOR_TEAL_BORDER,
        "Unified Client Application Layer",
        "React 18 SPA · Vite 5 · Tailwind CSS · Capacitor Android Native Shell",
        text_color=COLOR_TEAL_TITLE,
        sub_color=COLOR_TEAL_SUB
    )

    # Arrow 2 -> 3
    draw_arrow((CX, box2[3]), (CX, box2[3] + GAP))
    curr_y = box2[3] + GAP

    # 3. Security & Gateway Layer
    box3 = (CX - CARD_W // 2, curr_y, CX + CARD_W // 2, curr_y + H)
    draw_card(
        box3, COLOR_TEAL_BG, COLOR_TEAL_BORDER,
        "Security, Auth & Gateway (SecurityGate)",
        "TLS 1.3 HTTPS · Supabase JWT Bearer Auth · Role-Based Access Control (RBAC)",
        text_color=COLOR_TEAL_TITLE,
        sub_color=COLOR_TEAL_SUB
    )

    # Arrow 3 -> Decision
    draw_arrow((CX, box3[3]), (CX, box3[3] + GAP))
    curr_y = box3[3] + GAP

    # 4. Central Decision Hub (Orange)
    DEC_W = 430
    DEC_H = 70
    box_dec = (CX - DEC_W // 2, curr_y, CX + DEC_W // 2, curr_y + DEC_H)
    draw_card(
        box_dec, COLOR_ORANGE_BG, COLOR_ORANGE_BORDER,
        "Core Platform Engine Dispatcher",
        "Routing based on User Role, Permissions & Workflow State",
        title_font=get_font(font_bold_path, 20),
        sub_font=FONT_SUB_CARD,
        text_color=COLOR_ORANGE_TEXT,
        sub_color=COLOR_ORANGE_SUB
    )

    # -------------------------------------------------------------------------
    # 5. Dual Branching Columns
    # -------------------------------------------------------------------------
    LEFT_CX = 330
    RIGHT_CX = 990
    COL_W = 490
    COL_H = 88

    curr_y = box_dec[3] + GAP + 24
    branch_y = box_dec[1] + DEC_H // 2

    # Draw horizontal branching lines from decision hub
    draw.line([(box_dec[0], branch_y), (LEFT_CX, branch_y), (LEFT_CX, curr_y)], fill=COLOR_ARROW, width=3)
    draw_arrow((LEFT_CX, curr_y - 10), (LEFT_CX, curr_y))

    draw.line([(box_dec[2], branch_y), (RIGHT_CX, branch_y), (RIGHT_CX, curr_y)], fill=COLOR_ARROW, width=3)
    draw_arrow((RIGHT_CX, curr_y - 10), (RIGHT_CX, curr_y))

    # Short branch labels placed cleanly above branch line
    left_label = "MoU & Placements"
    right_label = "Attendance & NEP 2020"

    t_box_l = draw.textbbox((0, 0), left_label, font=FONT_BRANCH)
    l_w = t_box_l[2] - t_box_l[0]
    draw.text(((box_dec[0] + LEFT_CX) // 2 - l_w // 2, branch_y - 24), left_label, font=FONT_BRANCH, fill=COLOR_TEAL_TITLE)

    t_box_r = draw.textbbox((0, 0), right_label, font=FONT_BRANCH)
    r_w = t_box_r[2] - t_box_r[0]
    draw.text(((box_dec[2] + RIGHT_CX) // 2 - r_w // 2, branch_y - 24), right_label, font=FONT_BRANCH, fill=COLOR_TEAL_TITLE)

    # Left Box 1: Bilateral MoU Engine
    box_left1 = (LEFT_CX - COL_W // 2, curr_y, LEFT_CX + COL_W // 2, curr_y + COL_H)
    draw_card(
        box_left1, COLOR_TEAL_BG, COLOR_TEAL_BORDER,
        "Bilateral MoU Negotiation Engine",
        "HTML5 Canvas Dual-Signature Pad\nState-Standard Clauses · Legal Cryptographic Hash",
        text_color=COLOR_TEAL_TITLE,
        sub_color=COLOR_TEAL_SUB
    )

    # Right Box 1: Attendance Engine
    box_right1 = (RIGHT_CX - COL_W // 2, curr_y, RIGHT_CX + COL_W // 2, curr_y + COL_H)
    draw_card(
        box_right1, COLOR_TEAL_BG, COLOR_TEAL_BORDER,
        "Haversine Geofenced Attendance",
        "WebRTC Live Camera Biometric Selfie Verification\n500m Haversine Radius Mathematical Gate",
        text_color=COLOR_TEAL_TITLE,
        sub_color=COLOR_TEAL_SUB
    )

    # Second row in branches
    curr_y2 = curr_y + COL_H + 24

    # Left Box 2: Batch Allocation Engine
    draw_arrow((LEFT_CX, box_left1[3]), (LEFT_CX, curr_y2))
    box_left2 = (LEFT_CX - COL_W // 2, curr_y2, LEFT_CX + COL_W // 2, curr_y2 + COL_H)
    draw_card(
        box_left2, COLOR_TEAL_BG, COLOR_TEAL_BORDER,
        "Batch Proposal & Placement Engine",
        "GPA Pre-Screening · Batch Capacity Quotas\nInstitutional Decisions & Corporate Acceptance",
        text_color=COLOR_TEAL_TITLE,
        sub_color=COLOR_TEAL_SUB
    )

    # Right Box 2: NEP 2020 Academic Evaluation
    draw_arrow((RIGHT_CX, box_right1[3]), (RIGHT_CX, curr_y2))
    box_right2 = (RIGHT_CX - COL_W // 2, curr_y2, RIGHT_CX + COL_W // 2, curr_y2 + COL_H)
    draw_card(
        box_right2, COLOR_TEAL_BG, COLOR_TEAL_BORDER,
        "NEP 2020 Academic Evaluation",
        "Rubric: 40% Attendance + 30% Mentor + 30% Faculty\nState Standard GPA Conversion & Credit Transfer",
        text_color=COLOR_TEAL_TITLE,
        sub_color=COLOR_TEAL_SUB
    )

    # Convergence point
    curr_y = curr_y2 + COL_H + GAP

    # Convergence lines
    draw.line([(LEFT_CX, box_left2[3]), (LEFT_CX, curr_y - 16), (CX, curr_y - 16)], fill=COLOR_ARROW, width=3)
    draw.line([(RIGHT_CX, box_right2[3]), (RIGHT_CX, curr_y - 16), (CX, curr_y - 16)], fill=COLOR_ARROW, width=3)
    draw_arrow((CX, curr_y - 16), (CX, curr_y))

    # 6. Backend Layer: Supabase BaaS & PostgreSQL (Orange)
    box_baas = (CX - CARD_W // 2, curr_y, CX + CARD_W // 2, curr_y + H + 8)
    draw_card(
        box_baas, COLOR_ORANGE_BG, COLOR_ORANGE_BORDER,
        "Supabase BaaS & PostgreSQL 15 Engine",
        "Row Level Security (RLS) · State Machine RPCs & Database Triggers\nAudit Trails & Deno Serverless Edge Functions",
        title_font=get_font(font_bold_path, 21),
        sub_font=FONT_SUB_CARD,
        text_color=COLOR_ORANGE_TEXT,
        sub_color=COLOR_ORANGE_SUB
    )

    # Arrow to External Services
    draw_arrow((CX, box_baas[3]), (CX, box_baas[3] + GAP))
    curr_y = box_baas[3] + GAP

    # 7. External Cloud Services & CDNs
    box_ext = (CX - CARD_W // 2, curr_y, CX + CARD_W // 2, curr_y + H)
    draw_card(
        box_ext, COLOR_TEAL_BG, COLOR_TEAL_BORDER,
        "External Microservices & Edge Infrastructure",
        "Cloudinary CDN (Biometrics & Signs) · Resend Transactional Email · Vercel Edge",
        text_color=COLOR_TEAL_TITLE,
        sub_color=COLOR_TEAL_SUB
    )

    # Arrow to Bottom Output
    draw_arrow((CX, box_ext[3]), (CX, box_ext[3] + GAP))
    curr_y = box_ext[3] + GAP

    # 8. Bottom Terminal Card: Verified Outputs & Governance (Dark Navy)
    box_out = (CX - CARD_W // 2, curr_y, CX + CARD_W // 2, curr_y + H + 6)
    draw_card(
        box_out, COLOR_NAVY_BG, COLOR_NAVY_BORDER,
        "Verified Governance Outputs & Certificates",
        "Tamper-Proof QR Certificates · NEP 2020 University Credits · DPDP Act 2023 Audit Trail",
        title_font=get_font(font_bold_path, 22),
        sub_font=FONT_SUB_CARD,
        text_color=COLOR_TEXT_WHITE,
        sub_color=COLOR_TEXT_MUTED_WHITE
    )

    # Crop excess bottom space cleanly
    final_h = box_out[3] + 40
    img_cropped = img.crop((0, 0, WIDTH, final_h))

    # Save to disk
    out_dir = "public"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "ap_vidyaconnect_system_architecture.png")
    img_cropped.save(out_path, "PNG", dpi=(300, 300), optimize=True)

    img_cropped.save("ap_vidyaconnect_system_architecture.png", "PNG", dpi=(300, 300), optimize=True)
    print(f"[+] Successfully generated high-resolution architecture image at: {out_path}")
    return out_path

if __name__ == "__main__":
    create_architecture_diagram()
