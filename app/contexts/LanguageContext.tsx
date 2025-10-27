'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'th' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  th: {
    // Header
    'app.title': 'ระบบตรวจจับ Deepfake',
    'app.subtitle': 'ตรวจสอบภาพและวิดีโอด้วย AI ความแม่นยำสูง',
    'app.page_title': 'ระบบตรวจจับ Deepfake',
    'app.description': 'การตรวจจับดีปเฟกด้วย AI ขั้นสูงโดยใช้โมเดลการเรียนรู้เชิงลึกที่ล้ำสมัย อัปโหลดรูปภาพเพื่อตรวจจับเนื้อหาที่สร้างหรือดัดแปลงโดย AI ด้วยความแม่นยำสูง',
    'app.badge.accuracy': 'ความแม่นยำสูง',
    'app.badge.accuracy.desc': 'โมเดล Ensemble 3 ตัว',
    'app.badge.realtime': 'ประมวลผลรวดเร็ว',
    'app.badge.realtime.desc': 'วิเคราะห์อัตโนมัติ',
    'app.badge.explain': 'อธิบายผลด้วย AI',
    'app.badge.explain.desc': 'แสดงฮีทแมป Grad-CAM',

    // Upload
    'upload.title': 'อัปโหลดรูปภาพสำหรับตรวจจับ Deepfake',
    'upload.drag': 'ลากรูปภาพมาที่นี่...',
    'upload.support': 'รองรับ: JPEG, PNG, GIF, WebP • สูงสุด 10MB',
    'upload.select': 'เลือกรูปภาพ',
    'upload.analyzing': 'กำลังวิเคราะห์ด้วย AI...',
    'upload.progress': 'เสร็จสมบูรณ์',

    // Features
    'feature.accuracy': 'ความแม่นยำสูง',
    'feature.accuracy.desc': 'โมเดล Ensemble 3 ตัว',
    'feature.fast': 'ประมวลผลเร็ว',
    'feature.fast.desc': 'วิเคราะห์อัตโนมัติ',
    'feature.explain': 'คำอธิบายจาก AI',
    'feature.explain.desc': 'แสดงฮีทแมป Grad-CAM',

    // Errors
    'error.no_face': 'ไม่พบใบหน้าในรูปภาพ กรุณาอัปโหลดรูปที่มีใบหน้าชัดเจน',
    'error.file_large': 'ขนาดไฟล์เกิน 10MB กรุณาอัปโหลดรูปที่เล็กกว่า',
    'error.invalid_type': 'ประเภทไฟล์ไม่ถูกต้อง กรุณาอัปโหลด JPG, PNG หรือรูปแบบอื่นๆ',
    'error.network': 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาตรวจสอบว่า backend กำลังทำงาน',
    'error.confidence_low': 'ความมั่นใจในการตรวจจับใบหน้าต่ำเกินไป กรุณาอัปโหลดรูปที่ชัดเจนกว่าพร้อมแสงสว่างดี',
    'error.unknown': 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',

    // Results
    'result.fake': 'ตรวจพบการปลอมแปลง',
    'result.real': 'ดูเหมือนของจริง',
    'result.confidence': 'ความมั่นใจ',
    'result.analyze_another': 'วิเคราะห์รูปอื่น',
    'result.error_title': 'เกิดข้อผิดพลาดในการตรวจจับ',
    'result.try_another': 'ลองรูปอื่น',
    'result.processed_in': 'ประมวลผลใน',
    'result.confidence.high': 'สูง',
    'result.confidence.medium': 'ปานกลาง',
    'result.confidence.low': 'ต่ำ',
    'result.confidence.authentic': 'ของแท้',
    'result.reliability': 'ความน่าเชื่อถือ',
    'result.model_agreement': 'ความเห็นตรงกันของโมเดล',
    'result.indicators.title': 'ตัวบ่งชี้การปลอมแปลงที่สำคัญ',
    'result.indicators.unnatural_skin': 'เนื้อสัมผัสผิวหนังดูไม่เป็นธรรมชาติ',
    'result.indicators.unnatural_skin.desc': 'ผิวหนังอาจดูเรียบเกินไป มีพื้นผิวไม่สม่ำเสมอ หรือมีรูพรุนผิดปกติ',
    'result.indicators.face_boundary': 'ความไม่สอดคล้องของขอบใบหน้า',
    'result.indicators.face_boundary.desc': 'มีการเชื่อมต่อที่ผิดปกติหรือมองเห็นได้ชัดเจนระหว่างใบหน้าและพื้นหลัง',
    'result.indicators.facial_features': 'การจัดวางคุณลักษณะใบหน้าผิดปกติ',
    'result.indicators.facial_features.desc': 'ตา จมูก ปาก หรือหูอาจมีขนาด ตำแหน่ง หรือสัดส่วนไม่ธรรมชาติ',
    'result.indicators.lighting': 'ความไม่สอดคล้องของแสง',
    'result.indicators.lighting.desc': 'ทิศทางของแสงหรือเงาอาจไม่สอดคล้องกันในบริเวณต่างๆ ของใบหน้า',
    'result.indicators.compression': 'ข้อผิดพลาดการบีบอัด',
    'result.indicators.compression.desc': 'มีข้อผิดพลาดที่ผิดปกติหรือรูปแบบที่เกิดจากการบีบอัดของภาพ',
    'result.consensus.title': 'ความเห็นตรงกันของโมเดล',
    'result.consensus.strong': 'ความเห็นตรงกันแข็งแกร่ง',
    'result.consensus.strong.desc': 'โมเดลทั้งหมดมีความเห็นตรงกันอย่างมากในการจำแนกนี้',
    'result.consensus.moderate': 'ความเห็นตรงกันปานกลาง',
    'result.consensus.moderate.desc': 'โมเดลส่วนใหญ่มีความเห็นตรงกัน แต่มีความไม่แน่นอนบางอย่าง',
    'result.consensus.weak': 'ความเห็นตรงกันอ่อน',
    'result.consensus.weak.desc': 'โมเดลมีความเห็นที่หลากหลาย บ่งชี้ถึงกรณีที่ท้าทาย',
    'result.next.title': 'ขั้นตอนต่อไป',
    'result.next.fake.verify': 'ตรวจสอบแหล่งที่มาของภาพและบริบทก่อนแชร์',
    'result.next.fake.multiple': 'พิจารณาอัปโหลดภาพหลายภาพของบุคคลเดียวกันเพื่อการตรวจสอบที่ครอบคลุม',
    'result.next.fake.heatmap': 'ตรวจสอบฮีทแมปอย่างระมัดระวังเพื่อเข้าใจว่าตรวจพบอะไร',
    'result.next.real.caution': 'แม้จะผ่านการตรวจจับ แต่ควรใช้วิจารณญาณเสมอเมื่อประเมินความถูกต้อง',
    'result.next.real.verify': 'พิจารณาตรวจสอบแหล่งที่มาและบริบทของภาพ',
    'result.next.real.advanced': 'สำหรับการตรวจสอบที่สำคัญ พิจารณาใช้เครื่องมือตรวจสอบเพิ่มเติม',

    // Heatmap
    'heatmap.title': 'การวิเคราะห์จาก AI',
    'heatmap.gradcam_title': 'Grad-CAM Attention Heatmap',
    'heatmap.subtitle': 'คำอธิบายภาพของกระบวนการตัดสินใจของ AI',
    'heatmap.original': 'ต้นฉบับ',
    'heatmap.attention': 'Attention Heatmap',
    'heatmap.legend': 'คำอธิบายสี',
    'heatmap.legend.cool': 'เย็น (น้ำเงิน)',
    'heatmap.legend.cool.desc': 'ความสนใจต่ำ',
    'heatmap.legend.green': 'เขียว',
    'heatmap.legend.green.desc': 'ปกติ',
    'heatmap.legend.yellow': 'เหลือง',
    'heatmap.legend.yellow.desc': 'ปานกลาง',
    'heatmap.legend.red': 'แดง',
    'heatmap.legend.red.desc': 'ความสนใจสูง',
    'heatmap.unavailable': 'การวิเคราะห์บริเวณใบหน้าไม่พร้อมใช้งาน',
    'heatmap.top_regions': 'บริเวณที่โมเดลให้ความสนใจมากที่สุด',
    'heatmap.all_regions': 'การวิเคราะห์ทุกบริเวณ',
    'heatmap.suspicious': 'บริเวณที่ตรวจพบความผิดปกติ',
    'heatmap.view_all': 'ดูการวิเคราะห์ทุกบริเวณ',
    'heatmap.table.region': 'บริเวณ',
    'heatmap.table.avg_attention': 'ความสนใจเฉลี่ย',
    'heatmap.table.max_attention': 'ความสนใจสูงสุด',
    'heatmap.table.level': 'ระดับ',
    'heatmap.table.regions_count': 'บริเวณ',
    'heatmap.interpret.title': 'วิธีตีความฮีทแมปนี้',
    'heatmap.interpret.what_seeing': 'ฮีทแมปแสดงว่าโมเดล AI ให้ความสนใจกับส่วนใดของภาพมากที่สุดเมื่อตัดสินใจว่าภาพนี้เป็นของแท้หรือปลอม',
    'heatmap.interpret.red_areas': 'บริเวณสีแดง: บริเวณที่โมเดลให้ความสนใจมากที่สุด มักเป็นบริเวณที่มีร่องรอยการปลอมแปลงหรือความผิดปกติ',
    'heatmap.interpret.green_areas': 'บริเวณสีเขียว/น้ำเงิน: บริเวณที่โมเดลให้ความสนใจน้อย มักเป็นบริเวณที่ดูเป็นธรรมชาติ',
    'heatmap.technical.title': 'รายละเอียดทางเทคนิค',
    'heatmap.technical.gradcam': 'Grad-CAM (Gradient-weighted Class Activation Mapping) เป็นเทคนิคการแสดงภาพที่แสดงว่าโมเดลเครือข่ายประสาทเทียมมองไปที่บริเวณใดในภาพ',
    'heatmap.technical.ensemble': 'ฮีทแมปนี้แสดงการวิเคราะห์รวมจากโมเดลทั้งสามตัวในระบบ (Xception, F3Net, Effort-CLIP)',
    'heatmap.technical.regions': 'บริเวณที่ให้ความสนใจสูงมักตรงกับคุณลักษณะที่สำคัญต่อการตัดสินใจ เช่น ขอบใบหน้า รอบปาก หรือความไม่สอดคล้องของเนื้อสัมผัส',

    // Attention levels
    'attention.high': 'สูง',
    'attention.moderate': 'ปานกลาง',
    'attention.low': 'ต่ำ',

    // Model Performance
    'model.performance': 'ประสิทธิภาพแต่ละโมเดล',
    'model.agreement': 'ความเห็นตรงกันของโมเดล',

    // Modes
    'mode.image': 'รูปภาพ',
    'mode.batch': 'ชุด',
    'mode.video': 'วิดีโอ',
    'mode.webcam': 'เว็บแคม',
    'mode.realtime': 'ตรวจจับแบบ Real-time',
    'mode.locked': 'กำลังพัฒนา',

    // Common
    'common.processing': 'กำลังประมวลผล',
    'common.error': 'เกิดข้อผิดพลาด',
    'common.tryagain': 'ลองอีกครั้ง',

    // Video Detection
    'video.title': 'ตรวจจับ Deepfake ในวิดีโอ',
    'video.upload': 'อัปโหลดไฟล์วิดีโอ',
    'video.select': 'เลือกวิดีโอ',
    'video.support': 'รองรับ MP4, AVI, MOV • สูงสุด 100MB',
    'video.processing': 'กำลังประมวลผลวิดีโอ...',
    'video.analyzing': 'วิเคราะห์เฟรมเพื่อตรวจจับ Deepfake',
    'video.complete': 'การวิเคราะห์วิดีโอเสร็จสมบูรณ์',
    'video.analyze_another': 'วิเคราะห์วิดีโออื่น',
    'video.error.type': 'กรุณาอัปโหลดไฟล์วิดีโอที่ถูกต้อง (MP4, AVI, MOV ฯลฯ)',
    'video.error.size': 'ไฟล์วิดีโอใหญ่เกินไป (สูงสุด 100MB)',
    'video.error.processing': 'การประมวลผลวิดีโอล้มเหลว',
    'video.result.confidence': 'ความมั่นใจ',
    'video.result.fake_frames': 'เฟรมปลอม',
    'video.result.real_frames': 'เฟรมจริง',
    'video.result.fake_ratio': 'อัตราส่วนปลอม',
    'video.result.avg_confidence': 'ความมั่นใจเฉลี่ย',
    'video.info.title': 'ข้อมูลวิดีโอ',
    'video.info.duration': 'ระยะเวลา:',
    'video.info.total_frames': 'จำนวนเฟรมทั้งหมด:',
    'video.info.fps': 'FPS:',
    'video.info.resolution': 'ความละเอียด:',
    'video.processing.title': 'สถิติการประมวลผล',
    'video.processing.frames_analyzed': 'เฟรมที่วิเคราะห์:',
    'video.processing.frame_skip': 'ข้ามเฟรม:',
    'video.processing.frame_skip_value': 'ทุก {skip} เฟรม',
    'video.processing.time': 'เวลาประมวลผล:',
    'video.processing.fps': 'FPS การประมวลผล:',
    'video.heatmap.title': 'เฟรมที่น่าสงสัยที่สุด (Grad-CAM)',
    'video.heatmap.frame': 'เฟรม',
    'video.heatmap.fake_probability': 'ความน่าจะเป็นที่ปลอม',
    'video.details.title': 'รายละเอียดการประมวลผล',
    'video.details.frame_analysis': 'วิเคราะห์ทุก 5 เฟรมเพื่อประสิทธิภาพ',
    'video.details.max_frames': 'ประมวลผลสูงสุด 100 เฟรมต่อวิดีโอ',
    'video.details.heatmaps': 'สร้างฮีทแมป Grad-CAM สำหรับ 3 เฟรมที่น่าสงสัยที่สุด',
    'video.details.statistics': 'ให้สถิติโดยละเอียดทีละเฟรม',
    'video.details.verdict': 'คำตัดสินโดยรวมจากอัตราส่วนเฟรมปลอม',

    // Upload Assistant
    'assistant.title': 'คำแนะนำการอัปโหลด',
    'assistant.best_practices': 'แนะนำสำหรับความแม่นยำสูงสุด',
    'assistant.best_practices.resolution': 'ความละเอียดสูง:',
    'assistant.best_practices.resolution.desc': 'อัปโหลดภาพขนาดอย่างน้อย 512x512 พิกเซล',
    'assistant.best_practices.clear': 'ใบหน้าชัดเจน:',
    'assistant.best_practices.clear.desc': 'ควรมีแสงสว่างเพียงพอและใบหน้าชัดเจน',
    'assistant.best_practices.original': 'ไฟล์ต้นฉบับ:',
    'assistant.best_practices.original.desc': 'ใช้ภาพที่ไม่บีบอัดหรือบีบอัดน้อยที่สุด',
    'assistant.best_practices.front': 'หันหน้าตรง:',
    'assistant.best_practices.front.desc': 'ภาพที่หันหน้าตรงกล้องให้ผลลัพธ์ที่ดีที่สุด',
    'assistant.best_practices.single': 'บุคคลเดียว:',
    'assistant.best_practices.single.desc': 'ภาพที่มีใบหน้าหลักเพียงหนึ่งหน้าให้ผลชัดเจนที่สุด',
    'assistant.avoid': 'สิ่งที่ควรหลีกเลี่ยง',
    'assistant.avoid.compression': 'บีบอัดมาก:',
    'assistant.avoid.compression.desc': 'หลีกเลี่ยงไฟล์ JPEG ที่บีบอัดมาก (คุณภาพต่ำกว่า 70%)',
    'assistant.avoid.angles': 'มุมสุดโต่ง:',
    'assistant.avoid.angles.desc': 'ภาพด้านข้างหรือมุมสุดโต่งอาจลดความแม่นยำ',
    'assistant.avoid.filters': 'ฟิลเตอร์/เอฟเฟกต์:',
    'assistant.avoid.filters.desc': 'ภาพที่มีฟิลเตอร์หรือเอฟเฟกต์ศิลปะหนัก',
    'assistant.avoid.obstructions': 'สิ่งบดบัง:',
    'assistant.avoid.obstructions.desc': 'ใบหน้าที่บดบังด้วยมือ แว่นตากันแดด หรือหน้ากาก',
    'assistant.avoid.lowlight': 'แสงน้อยมาก:',
    'assistant.avoid.lowlight.desc': 'ภาพที่มืดหรือแสงน้อยเกินไป',
    'assistant.formats': 'รูปแบบไฟล์ที่รองรับ',
    'assistant.formats.list': 'JPEG, JPG, PNG, GIF, BMP, WebP • ขนาดสูงสุด 10MB ต่อไฟล์',
    'assistant.tips': 'เคล็ดลับมืออาชีพ',
    'assistant.tips.batch': 'ใช้โหมดชุดเพื่อวิเคราะห์หลายภาพอย่างมีประสิทธิภาพ',
    'assistant.tips.compare': 'เปรียบเทียบผลลัพธ์จากภาพต่างๆ ของบุคคลเดียวกัน',
    'assistant.tips.heatmap': 'ตรวจสอบฮีทแมปเพื่อเข้าใจว่า AI ตรวจจับอะไร',
    'assistant.tips.confidence': 'คะแนนความมั่นใจสูงแสดงถึงหลักฐานที่แข็งแกร่ง',
    'assistant.privacy': 'ความเป็นส่วนตัวของคุณได้รับการปกป้อง: ภาพถูกประมวลผลในเครื่องและไม่ถูกเก็บบนเซิร์ฟเวอร์',

    // Tips for Best Results (Alternative version - more natural Thai)
    'tips.title': 'คำแนะนำสำหรับผลลัพธ์ที่ดีที่สุด',
    'tips.resolution': 'อัปโหลดรูปความละเอียดสูง (ขั้นต่ำ 512x512 พิกเซล)',
    'tips.original': 'ใช้ไฟล์ต้นฉบับที่ไม่บีบอัดหากเป็นไปได้',
    'tips.clear': 'ตรวจสอบให้แน่ใจว่าใบหน้าชัดเจนและมีแสงสว่างเพียงพอ',
    'tips.batch': 'ประมวลผลแบบชุดจะเร็วกว่าอัปโหลดทีละรูป',
    'tips.export': 'ส่งออกผลลัพธ์ในรูปแบบ CSV หรือ JSON ได้',

    // Processing Details
    'processing.title': 'รายละเอียดการประมวลผล',
    'processing.frame_analysis': 'วิเคราะห์ทุก 5 เฟรมเพื่อประสิทธิภาพ',
    'processing.max_frames': 'ประมวลผลสูงสุด 100 เฟรมต่อวิดีโอ',
    'processing.heatmaps': 'สร้างฮีทแมป Grad-CAM สำหรับ 3 เฟรมที่น่าสงสัยที่สุด',
    'processing.statistics': 'ให้สถิติโดยละเอียดทีละเฟรม',
    'processing.verdict': 'คำตัดสินโดยรวมจากอัตราส่วนเฟรมปลอม',

    // Batch Mode
    'batch.upload.title': 'ลากรูปภาพมาที่นี่หรือคลิกเพื่ออัปโหลด',
    'batch.upload.subtitle': 'รองรับ JPG, PNG • สูงสุด 10 ไฟล์ • 10MB ต่อไฟล์',
    'batch.upload.button': 'เลือกไฟล์',
    'batch.upload.count': 'ไฟล์ที่อัปโหลด',
    'batch.upload.max': '(ถึงขอบเขตสูงสุด)',
    'batch.stats.total': 'ไฟล์ทั้งหมด',
    'batch.stats.completed': 'เสร็จสมบูรณ์',
    'batch.stats.processing': 'กำลังประมวลผล',
    'batch.stats.fake': 'ตรวจพบปลอม',
    'batch.stats.real': 'ของจริง',
    'batch.queue.title': 'คิวไฟล์',
    'batch.button.start': 'เริ่มวิเคราะห์',
    'batch.button.export_csv': 'ส่งออก CSV',
    'batch.button.export_json': 'ส่งออก JSON',
    'batch.file.confidence': 'ความมั่นใจ',
    'batch.file.processing_time': 'เวลาประมวลผล',
    'batch.complete.title': 'การวิเคราะห์เสร็จสมบูรณ์!',
    'batch.complete.analyzed': 'วิเคราะห์ทั้งหมด',
    'batch.complete.avg_confidence': 'ความมั่นใจเฉลี่ย',
    'batch.complete.total_time': 'เวลาประมวลผลรวม',
  },

  en: {
    // Header
    'app.title': 'Deepfake Detection System',
    'app.subtitle': 'AI-powered image and video verification',
    'app.page_title': 'Deepfake Detection System',
    'app.description': 'Advanced AI-powered deepfake detection using state-of-the-art deep learning models. Upload any image to detect AI-generated or manipulated content with high accuracy.',
    'app.badge.accuracy': 'High Accuracy',
    'app.badge.accuracy.desc': '3 Ensemble Models',
    'app.badge.realtime': 'Fast Processing',
    'app.badge.realtime.desc': 'Automated Analysis',
    'app.badge.explain': 'AI Explanation',
    'app.badge.explain.desc': 'Grad-CAM Heatmaps',

    // Upload
    'upload.title': 'Upload image for deepfake detection',
    'upload.drag': 'Drop your image here...',
    'upload.support': 'Supports: JPEG, PNG, GIF, WebP • Max 10MB',
    'upload.select': 'Select Image',
    'upload.analyzing': 'Analyzing image with AI...',
    'upload.progress': 'complete',

    // Features
    'feature.accuracy': 'High Accuracy',
    'feature.accuracy.desc': '3 Ensemble Models',
    'feature.fast': 'Fast Processing',
    'feature.fast.desc': 'Automated Analysis',
    'feature.explain': 'AI Explanation',
    'feature.explain.desc': 'Grad-CAM Heatmaps',

    // Errors
    'error.no_face': 'No face detected in image. Please upload a clear photo with a visible face.',
    'error.file_large': 'File size exceeds 10MB limit. Please upload a smaller image.',
    'error.invalid_type': 'Invalid file type. Please upload JPG, PNG, or other image formats.',
    'error.network': 'Cannot connect to backend server. Please check if the backend is running.',
    'error.confidence_low': 'Face detection confidence too low. Please upload a clearer image with better lighting.',
    'error.unknown': 'Unknown error occurred',

    // Results
    'result.fake': 'Likely Deepfake Detected',
    'result.real': 'Appears Authentic',
    'result.confidence': 'Confidence',
    'result.analyze_another': 'Analyze Another Image',
    'result.error_title': 'Detection Error',
    'result.try_another': 'Try Another Image',
    'result.processed_in': 'Processed in',
    'result.confidence.high': 'High',
    'result.confidence.medium': 'Medium',
    'result.confidence.low': 'Low',
    'result.confidence.authentic': 'Authentic',
    'result.reliability': 'Reliability',
    'result.model_agreement': 'Model Agreement',
    'result.indicators.title': 'Key Manipulation Indicators',
    'result.indicators.unnatural_skin': 'Unnatural Skin Texture',
    'result.indicators.unnatural_skin.desc': 'Skin may appear overly smooth, have inconsistent texture, or show unusual pore patterns',
    'result.indicators.face_boundary': 'Face Boundary Inconsistencies',
    'result.indicators.face_boundary.desc': 'Visible blending artifacts or unnatural transitions between face and background',
    'result.indicators.facial_features': 'Unusual Facial Feature Alignment',
    'result.indicators.facial_features.desc': 'Eyes, nose, mouth, or ears may have unnatural sizing, positioning, or proportions',
    'result.indicators.lighting': 'Lighting Inconsistencies',
    'result.indicators.lighting.desc': 'Light direction or shadows may not match consistently across different facial regions',
    'result.indicators.compression': 'Compression Artifacts',
    'result.indicators.compression.desc': 'Unusual compression errors or patterns that suggest image manipulation',
    'result.consensus.title': 'Model Consensus',
    'result.consensus.strong': 'Strong Consensus',
    'result.consensus.strong.desc': 'All models strongly agree on this classification',
    'result.consensus.moderate': 'Moderate Consensus',
    'result.consensus.moderate.desc': 'Most models agree, but with some uncertainty',
    'result.consensus.weak': 'Weak Consensus',
    'result.consensus.weak.desc': 'Models have mixed opinions, indicating a challenging case',
    'result.next.title': 'What to do next',
    'result.next.fake.verify': 'Verify the source and context of the image before sharing',
    'result.next.fake.multiple': 'Consider uploading multiple images of the same person for comprehensive verification',
    'result.next.fake.heatmap': 'Examine the heatmap carefully to understand what was detected',
    'result.next.real.caution': 'Even if passing detection, always use critical judgment when evaluating authenticity',
    'result.next.real.verify': 'Consider verifying the source and context of the image',
    'result.next.real.advanced': 'For critical verification, consider using additional verification tools',

    // Heatmap
    'heatmap.title': 'AI Analysis',
    'heatmap.gradcam_title': 'Grad-CAM Attention Heatmap',
    'heatmap.subtitle': 'Visual explanation of AI decision-making process',
    'heatmap.original': 'Original',
    'heatmap.attention': 'Attention Heatmap',
    'heatmap.legend': 'Color Legend',
    'heatmap.legend.cool': 'Cool (Blue)',
    'heatmap.legend.cool.desc': 'Low attention',
    'heatmap.legend.green': 'Green',
    'heatmap.legend.green.desc': 'Normal',
    'heatmap.legend.yellow': 'Yellow',
    'heatmap.legend.yellow.desc': 'Moderate',
    'heatmap.legend.red': 'Red',
    'heatmap.legend.red.desc': 'High attention',
    'heatmap.unavailable': 'Facial region analysis unavailable',
    'heatmap.top_regions': 'Top attention regions',
    'heatmap.all_regions': 'All regions analysis',
    'heatmap.suspicious': 'Detected anomalies',
    'heatmap.view_all': 'View all regions',
    'heatmap.table.region': 'Region',
    'heatmap.table.avg_attention': 'Avg Attention',
    'heatmap.table.max_attention': 'Max Attention',
    'heatmap.table.level': 'Level',
    'heatmap.table.regions_count': 'regions',
    'heatmap.interpret.title': 'How to Interpret This Heatmap',
    'heatmap.interpret.what_seeing': 'The heatmap shows which parts of the image the AI model focused on most when making its decision about whether the image is real or fake.',
    'heatmap.interpret.red_areas': 'Red areas: Regions the model paid the most attention to, often indicating signs of manipulation or anomalies.',
    'heatmap.interpret.green_areas': 'Green/Blue areas: Regions the model paid less attention to, typically appearing more natural.',
    'heatmap.technical.title': 'Technical Details',
    'heatmap.technical.gradcam': 'Grad-CAM (Gradient-weighted Class Activation Mapping) is a visualization technique that shows where a neural network model is looking in an image.',
    'heatmap.technical.ensemble': 'This heatmap represents the combined analysis from all three models in our ensemble (Xception, F3Net, Effort-CLIP).',
    'heatmap.technical.regions': 'High attention regions often correspond to features important for the decision, such as face boundaries, mouth area, or texture inconsistencies.',

    // Attention levels
    'attention.high': 'High',
    'attention.moderate': 'Moderate',
    'attention.low': 'Low',

    // Model Performance
    'model.performance': 'Model Performance',
    'model.agreement': 'Model Agreement',

    // Modes
    'mode.image': 'Image',
    'mode.batch': 'Batch',
    'mode.video': 'Video',
    'mode.webcam': 'Webcam',
    'mode.realtime': 'Real-time Detection',
    'mode.locked': 'Under development',

    // Common
    'common.processing': 'Processing',
    'common.error': 'Error occurred',
    'common.tryagain': 'Try Again',

    // Video Detection
    'video.title': 'Video Deepfake Detection',
    'video.upload': 'Upload a video file',
    'video.select': 'Select Video',
    'video.support': 'Supports MP4, AVI, MOV • Max 100MB',
    'video.processing': 'Processing Video...',
    'video.analyzing': 'Analyzing frames for deepfake detection',
    'video.complete': 'Video Analysis Complete',
    'video.analyze_another': 'Analyze Another Video',
    'video.error.type': 'Please upload a valid video file (MP4, AVI, MOV, etc.)',
    'video.error.size': 'Video file is too large (max 100MB)',
    'video.error.processing': 'Video processing failed',
    'video.result.confidence': 'Confidence',
    'video.result.fake_frames': 'Fake Frames',
    'video.result.real_frames': 'Real Frames',
    'video.result.fake_ratio': 'Fake Ratio',
    'video.result.avg_confidence': 'Avg Confidence',
    'video.info.title': 'Video Information',
    'video.info.duration': 'Duration:',
    'video.info.total_frames': 'Total Frames:',
    'video.info.fps': 'FPS:',
    'video.info.resolution': 'Resolution:',
    'video.processing.title': 'Processing Statistics',
    'video.processing.frames_analyzed': 'Frames Analyzed:',
    'video.processing.frame_skip': 'Frame Skip:',
    'video.processing.frame_skip_value': 'Every {skip} frames',
    'video.processing.time': 'Processing Time:',
    'video.processing.fps': 'Processing FPS:',
    'video.heatmap.title': 'Most Suspicious Frames (Grad-CAM Visualization)',
    'video.heatmap.frame': 'Frame',
    'video.heatmap.fake_probability': 'Fake Probability',
    'video.details.title': 'Processing Details',
    'video.details.frame_analysis': 'Analyzes every 5th frame for efficiency',
    'video.details.max_frames': 'Maximum 100 frames processed per video',
    'video.details.heatmaps': 'Generates Grad-CAM heatmaps for top 3 suspicious frames',
    'video.details.statistics': 'Provides detailed frame-by-frame statistics',
    'video.details.verdict': 'Overall verdict based on fake frame ratio',

    // Upload Assistant
    'assistant.title': 'Smart Upload Assistant',
    'assistant.best_practices': 'Best Practices for Accurate Detection',
    'assistant.best_practices.resolution': 'High Resolution:',
    'assistant.best_practices.resolution.desc': 'Upload images at least 512x512 pixels for best results',
    'assistant.best_practices.clear': 'Clear Faces:',
    'assistant.best_practices.clear.desc': 'Ensure faces are clearly visible and well-lit',
    'assistant.best_practices.original': 'Original Files:',
    'assistant.best_practices.original.desc': 'Use uncompressed or minimally compressed images when possible',
    'assistant.best_practices.front': 'Front-Facing:',
    'assistant.best_practices.front.desc': 'Images with faces looking directly at camera work best',
    'assistant.best_practices.single': 'Single Subject:',
    'assistant.best_practices.single.desc': 'Focus on images with one primary face for clearest results',
    'assistant.avoid': 'What to Avoid',
    'assistant.avoid.compression': 'Heavy Compression:',
    'assistant.avoid.compression.desc': 'Avoid highly compressed JPEG files (quality below 70%)',
    'assistant.avoid.angles': 'Extreme Angles:',
    'assistant.avoid.angles.desc': 'Profile shots or extreme angles may reduce accuracy',
    'assistant.avoid.filters': 'Filters/Effects:',
    'assistant.avoid.filters.desc': 'Images with heavy filters or artistic effects',
    'assistant.avoid.obstructions': 'Obstructions:',
    'assistant.avoid.obstructions.desc': 'Faces partially covered by hands, sunglasses, or masks',
    'assistant.avoid.lowlight': 'Very Low Light:',
    'assistant.avoid.lowlight.desc': 'Underexposed or very dark images',
    'assistant.formats': 'Supported Formats',
    'assistant.formats.list': 'JPEG, JPG, PNG, GIF, BMP, WebP • Maximum 10MB per file',
    'assistant.tips': 'Pro Tips',
    'assistant.tips.batch': 'Use batch mode to analyze multiple images efficiently',
    'assistant.tips.compare': 'Compare results across different photos of the same person',
    'assistant.tips.heatmap': 'Check the heatmap to understand what the AI is detecting',
    'assistant.tips.confidence': 'Higher confidence scores indicate stronger evidence',
    'assistant.privacy': 'Your privacy is protected: Images are processed locally and not stored on our servers',

    // Tips for Best Results (Alternative version)
    'tips.title': 'Tips for Best Results',
    'tips.resolution': 'Upload high-resolution images (minimum 512x512px)',
    'tips.original': 'Use original, uncompressed files when possible',
    'tips.clear': 'Ensure faces are clearly visible and well-lit',
    'tips.batch': 'Batch processing is faster than individual uploads',
    'tips.export': 'Results can be exported in CSV or JSON format',

    // Processing Details
    'processing.title': 'Processing Details',
    'processing.frame_analysis': 'Analyzes every 5th frame for efficiency',
    'processing.max_frames': 'Maximum 100 frames processed per video',
    'processing.heatmaps': 'Generates Grad-CAM heatmaps for top 3 suspicious frames',
    'processing.statistics': 'Provides detailed frame-by-frame statistics',
    'processing.verdict': 'Overall verdict based on fake frame ratio',

    // Batch Mode
    'batch.upload.title': 'Drop images here or click to upload',
    'batch.upload.subtitle': 'Supports JPG, PNG • Max 10 files • 10MB per file',
    'batch.upload.button': 'Select Files',
    'batch.upload.count': 'files uploaded',
    'batch.upload.max': '(Maximum reached)',
    'batch.stats.total': 'Total Files',
    'batch.stats.completed': 'Completed',
    'batch.stats.processing': 'Processing',
    'batch.stats.fake': 'Fake Detected',
    'batch.stats.real': 'Real',
    'batch.queue.title': 'Files Queue',
    'batch.button.start': 'Start Analysis',
    'batch.button.export_csv': 'Export CSV',
    'batch.button.export_json': 'Export JSON',
    'batch.file.confidence': 'confidence',
    'batch.file.processing_time': 'Processing Time',
    'batch.complete.title': 'Analysis Complete!',
    'batch.complete.analyzed': 'Total Analyzed',
    'batch.complete.avg_confidence': 'Average Confidence',
    'batch.complete.total_time': 'Total Processing Time',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('th');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && (saved === 'th' || saved === 'en')) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
