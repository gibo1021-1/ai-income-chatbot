// Bind this script to the PRIVATE consultation spreadsheet. No keys belong in the website.
var LEAD_HEADERS = ['접수일시','접수번호','이름','연락처','진단유형','추천과정','개인정보 동의','동의문 버전','동의문','상담상태','상담 메모','이메일','뉴스레터 수신 동의','뉴스레터 동의문'];
var LEAD_TYPES = ['AI 첫 수익화 도전형','AI 브랜드·수익 시스템 구축형','전문성 브랜드·작가형'];
var LEAD_COURSES = ['AI 첫 수익화 입문 과정','AI 브랜드·수익 시스템 과정','전문성 브랜드·책 출판 과정'];
var LEAD_VERSION = '2026-11-02-v2';
var LEAD_SITE = 'https://gibo1021-1.github.io';

function leadConfig_() {
  var p = PropertiesService.getScriptProperties();
  var config = { sheetId: p.getProperty('SPREADSHEET_ID'), controller: p.getProperty('PRIVACY_CONTROLLER') || '북 브랜딩 랩', retention: p.getProperty('PRIVACY_RETENTION') || '수집일로부터 3년' };
  if (!config.sheetId || !config.controller || !config.retention) throw new Error('Configuration incomplete');
  return config;
}
function leadConsent_(config) {
  return '수집·이용 주체: ' + config.controller + '\n목적: 코칭 및 교육을 위한 참고자료 활용, AI 진단 결과에 따른 전화 상담 및 과정 안내\n항목: 이름, 연락처, 진단유형, 추천과정\n보유·이용 기간: ' + config.retention + '\n동의를 거부할 수 있으며, 거부 시 전화 상담 신청은 불가합니다. 무료 진단과 자료는 계속 이용할 수 있습니다.';
}
function leadNewsletter_(config) {
  return '수집·이용 주체: ' + config.controller + '\n목적: 이메일 뉴스레터 발송\n항목: 이름, 이메일\n보유·이용 기간: ' + config.retention + '\n선택 동의를 거부해도 전화 상담 및 무료 자료 이용에는 영향이 없습니다.';
}
function leadSheet_(config) {
  var book = SpreadsheetApp.openById(config.sheetId);
  var sheet = book.getSheetByName('상담신청');
  if (!sheet) sheet = book.insertSheet('상담신청');
  if (sheet.getLastRow() === 0) sheet.appendRow(LEAD_HEADERS);
  var actual = sheet.getRange(1,1,1,LEAD_HEADERS.length).getValues()[0];
  if (JSON.stringify(actual.slice(0,11)) === JSON.stringify(LEAD_HEADERS.slice(0,11)) && actual.slice(11).every(function(v){return !v;})) {
    sheet.getRange(1,12,1,3).setValues([LEAD_HEADERS.slice(11)]);
    actual = sheet.getRange(1,1,1,LEAD_HEADERS.length).getValues()[0];
  }
  if (JSON.stringify(actual) !== JSON.stringify(LEAD_HEADERS)) throw new Error('Unexpected sheet schema');
  return sheet;
}
function setup() {
  var properties = PropertiesService.getScriptProperties();
  if (!properties.getProperty('SPREADSHEET_ID')) {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (!active) throw new Error('Open this script from the consultation spreadsheet');
    properties.setProperty('SPREADSHEET_ID', active.getId());
  }
  var config = leadConfig_();
  var sheet = leadSheet_(config);
  sheet.setFrozenRows(1);
  sheet.getRange(1,1,1,LEAD_HEADERS.length).setFontWeight('bold').setBackground('#eeeeee');
  sheet.getRange('D:D').setNumberFormat('@');
}
function validateLead_(p) {
  var name = String(p.name || '').trim();
  var phone = String(p.phone || '').replace(/[\s-]/g,'');
  if (!/^[\p{L}\p{M}][\p{L}\p{M} .'-]{1,39}$/u.test(name)) throw new Error('Invalid name');
  if (!/^01[016789]\d{7,8}$/.test(phone)) throw new Error('Invalid phone');
  if (p.consent !== 'true' || p.consentVersion !== LEAD_VERSION || p.website) throw new Error('Invalid consent');
  if (!/^[0-2]$/.test(String(p.type))) throw new Error('Invalid type');
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(String(p.requestId || ''))) throw new Error('Invalid request');
  var newsletter = p.newsletterConsent === 'true';
  var email = newsletter ? String(p.email || '').trim() : '';
  if (newsletter && (email.length > 254 || !/^[A-Za-z0-9][A-Za-z0-9.!#$%&'*+/?^_`{|}~-]*@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}$/.test(email))) throw new Error('Invalid email');
  return {name:name, phone:phone, type:Number(p.type), requestId:p.requestId, newsletter:newsletter, email:email};
}
function reply_(requestId, status) {
  var payload = JSON.stringify({source:'ai-next-consultation',requestId:requestId,status:status}).replace(/</g,'\\u003c');
  return HtmlService.createHtmlOutput('<!doctype html><html><body><script>window.top.postMessage(' + payload + ',' + JSON.stringify(LEAD_SITE) + ');</script></body></html>').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function doGet() { return ContentService.createTextOutput('전화 상담은 진단 사이트에서 신청해 주세요.'); }
function doPost(e) {
  var p = e && e.parameter || {};
  var requestId = /^[a-f0-9-]{36}$/i.test(String(p.requestId || '')) ? p.requestId : '';
  var lock;
  try {
    var config = leadConfig_();
    var lead = validateLead_(p);
    if (lead.newsletter && p.newsletterText !== leadNewsletter_(config)) throw new Error('Newsletter consent changed');
    if (p.consentText !== leadConsent_(config)) throw new Error('Consent changed');
    lock = LockService.getScriptLock();
    lock.waitLock(10000);
    var sheet = leadSheet_(config);
    var last = sheet.getLastRow();
    if (last > 1 && sheet.getRange(2,2,last-1,1).createTextFinder(lead.requestId).matchEntireCell(true).findNext()) return reply_(lead.requestId,'success');
    var cache = CacheService.getScriptCache();
    var minute = Math.floor(Date.now()/60000);
    var key = 'lead-count-' + minute;
    var count = Number(cache.get(key) || 0);
    if (count >= 30 || cache.get('lead-phone-' + lead.phone)) throw new Error('Rate limited');
    var when = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
    var row = [when,lead.requestId,lead.name,lead.phone,LEAD_TYPES[lead.type],LEAD_COURSES[lead.type],'동의',LEAD_VERSION,leadConsent_(config),'신규','',lead.email,lead.newsletter ? '동의' : '미동의',lead.newsletter ? leadNewsletter_(config) : ''];
    sheet.getRange(last+1,1,1,row.length).setNumberFormat('@').setValues([row]);
    SpreadsheetApp.flush();
    cache.put(key,String(count+1),120);
    cache.put('lead-phone-' + lead.phone,'1',60);
    return reply_(lead.requestId,'success');
  } catch (error) {
    // Never log submitted names, phone numbers or payloads.
    return reply_(requestId,'error');
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}
