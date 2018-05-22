using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;
using System.Data;
using System.Data.SqlClient;
using AtlantCRM.Models;
using AutoMapper;
using System.Globalization;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System.Dynamic;
using System.Threading.Tasks;
using System.Threading;
using System.Text;
using System.Security.Cryptography;
using System.IO;
using ClosedXML.Excel;
using Ionic.Zip;

namespace AtlantCRM.Controllers {

  [Authorize]
  public class HomeController:Controller {

    public const int M_ORG_TYPE_ID_ADMINISTRATSIYA = 1;
    public const int M_ORG_TYPE_ID_DILER_A = 2;
    public const int M_ORG_TYPE_ID_DILER_C = 3;
    public const int M_ORG_TYPE_ID_DILER_D = 4;
    public const int M_ORG_TYPE_ID_TEH_OTDEL = 5;

    public const int M_ORG_ID_ADMINISTRATSIYA = 1;

    public const int S_USER_ROLE_ID_STAJER = 1;
    public const int S_USER_ROLE_ID_DIRECTOR = 5;

    public const int SEANS_STATE_ZAPISALSYA = 0;
    public const int SEANS_STATE_SOSTOYALSYA = 1;

    public const int SumOrAvg_SUM = 1;
    public const int SumOrAvg_AVG = 2;

    public const int M_STATUS_ID_POTEN_POKUP = 2;
    public const int M_STATUS_ID_PREDOPL = 11;

    public const int M_RASHOD_STAT_ID_INKAS = 17;

    // количество мест в салоне всегда 18
    public const int PLACE_COUNT = 18;

    // количество презентаций в день, всегда 12
    public const int PRESENTATION_COUNT = 12;

    // Источник информации "Сотрудник"
    public const int M_IST_INFO_SOTRUDNIK = 1;
    // Источник информации "Посетитель"
    public const int M_IST_INFO_POSET = 4;

    // Тип оповещения "Чужой клиент"
    public const int O_OPOV_TIP_CHUJOY_KLIENT = 1;
    // Тип оповещения "Дешёвая продажа"
    public const int O_OPOV_TIP_DESHEVAYA_PRODAJA = 2;

    // вид события "Звонок"
    public const int M_VID_SOB_ZVONOK = 1;
    // вид события "Не пришедшие"
    public const int M_VID_SOB_NE_PRISHEDSHIE = 3;
    // пустое фото по умолчанию
    public const string EMPTY_PHOTO = "Content/img/u4.png";

    // уведомления Не выполненные dbo.O_UVEDOML.ISP
    public const int ISP_NE_VIP = 0;
    // уведомления Выполненные dbo.O_UVEDOML.ISP
    public const int ISP_VIP = 1;

    // техотдел статус - сделал
    public const int M_SERVICE_TYPE_ID_SDELAL = 4;

    // при смене статесе организации - неактивна - пароль всем сотрудникам меняем
    public const string NEW_PASSWORD_HASH = "ADJKbsVtKjkLP5+G2IM8A4gHe01jPrvms9/uwObSBbk0QX9ZjYntzAfBzbrcXKR34Q=="; 

    /// <summary>
    /// Количество элементов на странице для получения всех записей (режим База)
    /// </summary>
    public const int ROWS_PER_PAGE_BAZA_ALL = 100000;

    //// признак скрытия анкеты Контактов
    // не скрыта
    public const int O_KONT_ANK_SKR_NE_SKRITA = 0;
    // скрыта пользователем
    public const int O_KONT_ANK_SKR_SKRITA_POLZOVAT = 1;
    // скрыта при создании настоящей анкеты
    public const int O_KONT_ANK_SKR_SKRITA_PRI_SOZD_ANK = 2;

    //// признак скрытия анкеты Рекомендованных
    // не скрыта
    public const int O_REK_ANK_SKR_NE_SKRITA = 0;
    // скрыта пользователем
    public const int O_REK_ANK_SKR_SKRITA_POLZOVAT = 1;
    // скрыта при создании настоящей анкеты
    public const int O_REK_ANK_SKR_SKRITA_PRI_SOZD_ANK = 2;

    // статус контакта "<выберите статус>"
    public const int M_KONT_STATUS_ID_VIBERITE_STATUS = 1;
    // статус контакта "Срочно"
    public const int M_KONT_STATUS_ID_SROCHNO = 2;


    // Тип изменения в поле dbo.O_KONT_STAT.TIP_IZM
    // 1 - Звонок, 2 - Создан контакт, 3 - Добавлен комментарий, 4 - Изменён статус, 5 - Изменён источник
    public enum O_KONT_STAT_TIP_IZM {ZVONOK = 1, SOZDAN_KONT = 2, DOBAV_COMMENT = 3, IZM_STATUS = 4, IZM_ISTOCH = 5};

    // внешний вид режима Регистрация, dbo.O_NASTR.VNESH_VID_REG
    public const string VNESH_VID_REG_SO_SPISKOM_MEST = "SO_SPISKOM_MEST";
    public const string VNESH_VID_REG_SO_SPISKOM_FIO = "SO_SPISKOM_FIO";


    public readonly DateTime SmallDateTimeMinValue = new DateTime(1900, 01, 01, 00, 00, 00); 
    public readonly DateTime SmallDateTimeMaxValue = new DateTime(2079, 06, 06, 23, 59, 00);

    // действие с анкетой
    public const int M_DEISTV_ANKETA = 1;
    // действие с общением
    public const int M_DEISTV_DIALOG = 2;
    // действие со звонками
    public const int M_DEISTV_ZVONKI = 3;
    // действие с записью
    public const int M_DEISTV_SEANS = 4;
    // действие с контактами
    public const int M_DEISTV_KONTAKT = 5;
    // действие с учетом
    public const int M_DEISTV_UCHET = 6;
    // действие с раходами
    public const int M_DEISTV_RASHODY = 7;
    // действие с выдачей товара
    public const int M_DEISTV_VYDANO = 8;
    // действие со штрих-кодом
    public const int M_DEISTV_SHTRIH_KOD = 9;

    public class StatPos {
      public DateTime? d_pos { get; set; }
      // название основного абонемента и количество посещений в виде: Абонемент (1 мес.): 1
      public string str_kolvo_osn { get; set; }
      // название доп. услуги и количество посещений в виде: Процедура Миостимуляция 25 мин. : 1
      public string str_kolvo_dop { get; set; }
      // собранная из str_kolvo_osn и str_kolvo_dop итоговая строка, str_kolvo_dop может быть несколько
      public string str_kolvo { get; set; }
    }

    public class StatPriost {
      public DateTime? d_priost_s { get; set; }
      public DateTime? d_priost_po { get; set; }
      public int? kolvo_dn { get; set; }
    }

    public class AnkData {
      public string fio;
      public string phone;
      public string birth_day;
      public string age;
      public string address;
      public string kto;
      public string first_visit;
      public string last_visit;
      public string all_visits;
      public string nepreryv;
      public string sicks;
      public string complaint;
			public string subdate;
      public string fio_reg;
      public string zabol;
      public string birth;
      public string contact;
      public string cycle;
      public string contact_fio;
      public string surname;
      public string name;
      public string secname;
      public List<StatPos> posList { get; set; }
      public List<StatPriost> priostList { get; set; }
    }

    public class SeansData {
      public int? id { get; set; }
      public int? seans_state1 { get; set; }
      public int? m_ryad_id1 { get; set; }
      public int? m_seans_time_id1 { get; set; }
      public int? o_ank_id1 { get; set; }
      public string seans_date1 { get; set; }
      public string fio1 { get; set; }
      public int? visits1 { get; set;  }
      public int? birth1 { get; set; }
      public string date_reg1 { get; set; }
      public int? dialog1 { get; set; }
      public int? id1 { get; set; }
      public int? seans_state2 { get; set; }
      public int? m_ryad_id2 { get; set; }
      public int? m_seans_time_id2 { get; set; }
      public int? o_ank_id2 { get; set; }
      public string seans_date2 { get; set; }
      public string fio2 { get; set; }
      public int? visits2 { get; set; }
      public int? birth2 { get; set; }
      public string date_reg2 { get; set; }
      public int? dialog2 { get; set; }
      public int? id2 { get; set; }
    }

    // класс для сохранения общения
    public class O_DATA {
      public int ID { get; set; }
      public List<O_DIALOG> O_DIALOG { get; set; }
      public List<O_STATUS> O_STATUS { get; set; }
      public List<O_COMPLAINT> O_COMPLAINT { get; set; }
    }

    // класс для сохранения анкеты и записи на сеанс
    public class O_RECORD {
      public O_ANK O_ANK { get; set; }
      public O_SEANS O_SEANS { get; set; }
    }

    public class DialogInfo {
      public int? visits { get; set; }
      public string first_visit { get; set; }
      public string last_visit { get; set; }
      public string nepreryv { get; set; }
      public string zabol { get; set; }
    }

    // класс сохранения звонков
    public class O_ZVONOK_DATA {
      public List<O_ZVONOK> O_ZVONOK { get; set; }
      public List<O_SEANS> O_SEANS { get; set; }
    }

    public class StatSeansInfo {
      public string time { get; set; }
      public string visits { get; set; }
      public string part { get; set; }
    }

    public class RecordData {
      public int? o_ank_id { get; set; }
      public int? m_seans_time_id { get; set; }
      public int? seans_state { get; set; }
      public string fio { get; set; }
      public int? birth { get; set; }
      public string date_reg { get; set; }
      public int? dialog { get; set; }
      public int? visits { get; set; }
      public int? nrow { get; set; }
      public int? ncol { get; set; }
      public int? new_seans { get; set; }
      public string phone { get; set; }
      public string fio_full { get; set; }
      public string reg_time { get; set; }
      public string user_ryad_1 { get; set; }
      public string user_ryad_2 { get; set; }
      public int? bez_reg { get; set; }
      public string lane_time { get; set; }
      public string bez_reg_user { get; set; }
      public string zabol { get; set; }
      public int? id { get; set; }
      public string seans_date { get; set; }
      public int? is_first_kont_seans { get; set; }
      public string ist_info { get; set; }
      public int vip { get; set; }
      public int ostalos_dn_abon { get; set; }
      public int isAbonZadol { get; set; }
      public int isAbonViplach { get; set; }
    }

    public class UserContext {
      public int ID { get; set; }
      public int S_USER_ROLE_ID { get; set; }
      public string S_USER_ROLE_ID_NAME { get; set; }
      public string SURNAME { get; set; }
      public string NAME { get; set; }
      public string SECNAME { get; set; }
      public int M_ORG_ID { get; set; }
      public string M_ORG_ID_NAME { get; set; }
      public string AspNetUsersId { get; set; }
      public string UserName { get; set; }
      public int M_ORG_TYPE_ID { get; set; }
      public string M_ORG_TYPE_ID_NAME { get; set; }
      public string fio {get; set;}
      public string M_ORG_ADRES {get; set;}
      public string M_ORG_PHONE {get; set;}
      public int IS_ADM { get; set; }
      public int IS_DILER_A { get; set; }
      public int IS_DILER_C { get; set; }
      public int M_ORG_ID_DILER_A { get; set; }
      public int M_ORG_ID_DILER_C { get; set; }
      public int PARENT_M_ORG_ID { get; set; }
      public int PARENT_M_ORG_TYPE_ID { get; set; }
      public string PARENT_M_ORG_ID_NAME { get; set; }
    }

    public class SeansPlaceData {
      public int ID { get; set; }
      public string NAME { get; set; }
      public int? M_PRODUCT_ID { get; set; }
      public int? M_RYAD_ID { get; set; }
      public int? M_ORG_ID { get; set; }
      public string NUM { get; set; }
    }

    public class SkladData {
      public int ID { get; set; }
      public string NAME { get; set; }
      public int? KOLVO { get; set; }
      public Decimal? COST { get; set; }
    }

    public class UchetSpisPokupData {
      public int VIP { get; set; }
      public string FIO { get; set; }
      public DateTime? D_VID { get; set; }
      public string PHONE { get; set; }
      public string NAME { get; set; }
      public string VID { get; set; }
      public Decimal? SUMMA { get; set; }
      public int? O_ANK_ID { get; set; }
      public int? M_PRODUCT_ID { get; set; }
      public int? RN { get; set; }
      public int? KOLVO { get; set; }
      public int OSTALOS_DN_ABON { get; set; }
      public int SEANS_CNT { get; set; }
      public int? O_SKLAD_RAS_ID { get; set; }
    }

    public class UchetDebetZadolData {
      public int? M_PRODUCT_ID { get; set; }
      public DateTime? D_OPL { get; set; }
      public string FIO { get; set; }
      public string PHONE { get; set; }
      public Decimal? SUMMA { get; set; }
      public int? O_ANK_ID { get; set; }
      public int? O_SKLAD_RAS_ID { get; set; }
      public DateTime? D_NEXT_OPL { get; set; }
      public int? RN { get; set; }
    }

    public class UchetDohodData {
      public Decimal? TOVAROOB { get; set; }
      public Decimal? SEBEST { get; set; }
      public Decimal? BRUTTO_PR { get; set; }
      public Decimal? RASHOD { get; set; }
      public Decimal? CHIST_PR { get; set; }
      public Decimal? RENT { get; set; }
      public Decimal? VALOV_DOHOD { get; set; }
      public Decimal? TOCHKA_BEZUB { get; set; }
    }

    public class UchetRashodData {
      public int ID { get; set; }
      public DateTime? D_SCHET { get; set; }
      public Decimal? SUMMA { get; set; }
      public string KTO { get; set; }
    }

    public class BazaListParams {
      public int? page { get; set; }
      public string fio { get; set; }
      public int? posHodit { get; set; }
      public int? posDn { get; set; }
      public DateTime? posNaDatu { get; set; }
      public int? zabolId { get; set; }
      public DateTime? periodS { get; set; }
      public DateTime? periodPo { get; set; }
      public int? regS { get; set; }
      public int? regPo { get; set; }
      public int? seansId { get; set; }
      public string productIds { get; set; }
      public int? kategId { get; set; }
      public int? uluchId { get; set; }
      public string dopFilter { get; set; }
      public DateTime? dZv { get; set; }
      public int dZvOrderBy { get; set; }
    }

    public class SmsCallAccountData {
      public string login { get; set; }
      public string password { get; set; }
      public string phone { get; set; }
      public string sip_key { get; set; }
      public string sip_secret { get; set; }
      public string sender { get; set; }
    }

    public class DeistvListParams {
      public int? s_user_id { get; set; }
      public int? m_deistv_id { get; set; }
      public DateTime? date_from { get; set; }
      public DateTime? date_to { get; set; }
      public string substr { get; set; }
    }

    public class ReportSalesData {
      public string pol { get; set; }
      public int? vozrast { get; set; }
      public int? kolpos { get; set; }
      public int? kakdolgo { get; set; }
      public Decimal? kolpok { get; set; }
      public Decimal? kupilnasummu { get; set; }
    }

    public class ReportOprosData {
      public string NAME { get; set; }
      public int? M_VOPROS_TAB_ID { get; set; }
      public string DA { get; set; }
      public string NET { get; set; }
      public string PUSTO { get; set; }
    }

    public class ReportMetrikaData {
      public int? ID { get; set; }
      public string NAME { get; set; }
      public decimal? VALOV_DOHOD { get; set; }
      public int? NOVYH { get; set; }
      public int? SRED { get; set; }
      public decimal? VSEGO { get; set; }
    }

    public class TehOtdelData {
      public int? ID { get; set; }
      public int? O_ANK_ID { get; set; }
      public DateTime? D_START { get; set; }
      public DateTime? DATE_TEH_OTDEL { get; set; }
      public string FIO { get; set; }
      public string PHONE { get; set; }
      public string M_PRODUCT_ID_NAME { get; set; }
      public string M_SERVICE_TYPE_ID_NAME { get; set; }
      public string M_SERVICE_TYPE_ID_TEH_OTDEL_NAME { get; set; }
			public string COMMENT { get; set; }
      public string COMMENT_TEH_OTDEL { get; set; }
      public int? M_SERVICE_TYPE_ID { get; set; }
      public int? M_SERVICE_TYPE_ID_TEH_OTDEL { get; set; }
      public string SERIAL_NUMBER { get; set; }
      public int? M_ORG_ID { get; set; }
    }

    public class UserRights {
      public int? GR_ID { get; set; }
      public string GR_NAME { get; set; }
      public int? REJ_ID { get; set; }
      public string REJ_NAME { get; set; }
      public int? READ { get; set; }
      public int? WRITE { get; set; }
    }

    public class CalendProdajData {
      public int ID { get; set; }
      public int? O_ANK_ID { get; set; }
      public string FIO { get; set; }
      public int? M_PRODUCT_ID { get; set; }
      public string M_PRODUCT_ID_NAME { get; set; }
      public DateTime? STATUS_DATE { get; set; }
      public string USERNAME { get; set; }
      public Decimal? PRICE { get; set; }
      public int? DAY_RN { get; set; }
      public string DAY_NAME { get; set; }
      public int? DAY_HEADER { get; set; }
    }

    public class ReportUvedomlData {
      public string VOBSHEM { get; set; }
      public string ZVONOK { get; set; }
      public string DOPLATA { get; set; }
      public string NEPRISHEDSHIE { get; set; }
      public string NAPOMINANIE { get; set; }
      public string SOTRUDNIK { get; set; }
    }

    public class SaloniData {
      public int M_ORG_ID { get; set; }
      public double NAPOL { get; set; }
      public double NOV_POSET_COUNT { get; set; }
      public double ZVONKI_COUNT { get; set; }
      public double SOTRUD_COUNT { get; set; }
      public double KONT_COUNT { get; set;}
    }

    public class BarcodeData {
      public string id { get; set; }
      public string img { get; set; }
    }

    public class SoprData {
      public int? ID { get; set; }
      public int? O_ANK_ID { get; set; }
      public int? RN { get; set; }
      public DateTime? DATE_REG { get; set; }
      public string FIO { get; set; }
      public string PHONE_NUM { get; set; }
      public string PHONE { get; set; }
      public string IST { get; set; }
      public int? M_SOPR_PRODUCT_ID { get; set; }
      public int? M_SOPR_DOP_ID { get; set; }
      public int? M_SOPR_FORM_OPL_ID { get; set; }
      public int? M_SOPR_STATUS_ID { get; set; }
      public int? VISITS { get; set; }
      public DateTime? LAST_VISIT { get; set; }
      public DateTime? DATE_WORK { get; set; }
      public string COMMENT { get; set; }
      public string ZADACHA { get; set; }
      public int? CNT { get; set; }
      public int? CNT_PAGE { get; set; }
      public int? IS_SROCHNO { get; set; }
      public DateTime? NE_HODIT_DATE { get; set; }
    }

    public class SoprCommentData {
      public int? ID { get; set; }
      public int? O_ANK_ID { get; set; }
      public int? O_SOPR_ID { get; set; }
      public int? RN { get; set; }
      public DateTime? D_START { get; set; }
      public string COMMENT { get; set; }
      public string ZADACHA { get; set; }
      public string USERNAME { get; set; }
    }

    public class ProdlData {
      public int? ID { get; set; }
      public int? O_ANK_ID { get; set; }
      public int? RN { get; set; }
      public DateTime? D_VID { get; set; }
      public string FIO { get; set; }
      public string PHONE_NUM { get; set; }
      public string PHONE { get; set; }
      public int? OST { get; set; }
      public string M_PRODUCT_NAME { get; set; }
      public string M_FORM_OPL { get; set; }
      public int? M_SOPR_STATUS_ID { get; set; }
      public int? VISITS { get; set; }
      public DateTime? LAST_VISIT { get; set; }
      public DateTime? DATE_WORK { get; set; }
      public string COMMENT { get; set; }
      public string ZADACHA { get; set; }
      public int? CNT { get; set; }
      public int? CNT_PAGE { get; set; }
      public int? IS_SROCHNO { get; set; }
      public int? VIP { get; set; }
      public DateTime? D_DEISTV { get; set; }
    }

    public class ProdlCommentData {
      public int? ID { get; set; }
      public int? O_ANK_ID { get; set; }
      public int? O_PRODL_ID { get; set; }
      public int? RN { get; set; }
      public DateTime? D_START { get; set; }
      public string COMMENT { get; set; }
      public string ZADACHA { get; set; }
      public string USERNAME { get; set; }
    }

    public class UchetGostData {
      public DateTime? D_REG { get; set; }
      public string FIO { get; set; }
      public string PHONE { get; set; }
      public string ADDRESS { get; set; }
      public DateTime? D_DEISTV { get; set; }
    }

    public class UchetNeProdlilData {
      public int? O_ANK_ID { get; set; }
      public string FIO { get; set; }
      public string PHONE { get; set; }
      public int? VIP { get; set; }
      public int? O_SKLAD_RAS_ID { get; set; }
      public int? M_PRODUCT_ID { get; set; }
      public string NAME { get; set; }
      public Decimal? SUMMA { get; set; }
      public string VID { get; set; }
      public DateTime? D_VID { get; set; }
      public DateTime? D_DEISTV { get; set; }
      public int? OSTALOS_DN_ABON { get; set; }
      public int? SEANS_CNT { get; set; }
      public int? O_SKLAD_RAS_PRODUCT_ID { get; set; }

    }

    public class UchetNeHodyatData {
      public int? VIP { get; set; }
      public string FIO { get; set; }
      public DateTime? D_VID { get; set; }
      public string PHONE { get; set; }
      public string NAME { get; set; }
      public string VID { get; set; }
      public Decimal? SUMMA { get; set; }
      public int? O_ANK_ID { get; set; }
      public int? OSTALOS_DN_ABON { get; set; }
      public int? O_SKLAD_RAS_ID { get; set; }
      public int? VISITS { get; set; }
      public int? RN { get; set; }
      public int? CNT { get; set; }
      public int? CNT_PAGE { get; set; }
      public DateTime? NE_HODIT_DATE { get; set; }
    }

    public class RecordAnkProductData {
      public string NAME { get; set; }
      public int? CNT { get; set; }
    }

    public class AutoSmsSendData {
      public int O_ANK_ID { get; set; }
      public string PHONE { get; set; }
      public DateTime? D_START { get; set; }
      public int M_ORG_ID { get; set; }
      public int M_SMS_TEMPLATE_TYPE_ID { get; set; }
      public string SOOB { get; set; }
    }

    string[] arrayMonth = {"января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"};
    string[] arrayMonthKr = { "ЯНВ", "ФЕВ", "МАР", "АПР", "МАЙ", "ИЮН", "ИЮЛ", "АВГ", "СЕН", "ОКТ", "НОЯ", "ДЕК" };
    string[] year = { "год", "года", "лет" };
    string[] month = { "месяц", "месяца", "месяцев" };
    string[] day = { "день", "дня", "дней" };

    public JsonResult GetCurrentUserInfo() {
      UserContext uc = GetUserContext();
      return Json(uc, JsonRequestBehavior.AllowGet);
    }

    public ActionResult Index() {

      UserContext uc = GetUserContext();

      using(ATLANTEntities db = new ATLANTEntities()) {

        O_NASTR nastr = db.O_NASTR.Where(x => x.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();
        if (nastr == null) {
          ViewBag.VNESH_VID_REG = VNESH_VID_REG_SO_SPISKOM_MEST;
        } else {
          ViewBag.VNESH_VID_REG = nastr.VNESH_VID_REG;
        }



      }

      return View();
    }

    public ActionResult About() {
      ViewBag.Message = "Your application description page.";

      return View();
    }

    public ActionResult Contact() {
      ViewBag.Message = "Your contact page.";

      return View();
    }



    // скрыть Контакт, если есть соответствие с переданной анкетой
    private void HideKont(O_ANK o_ank) {

      DateTime now = CreateDate();
      UserContext uc = GetUserContext();

      using(ATLANTEntities db = new ATLANTEntities()) {

        // при сохранении анкеты скрываем сооветствующий контакт, если есть

        // находим список контактов у которых совпадает номр телефона 
        // либо домашний либо сотовый (включаем ситцацию, что человек был добавлен нескольро раз)
        var hidedKontact = db.O_KONT_ANK.Where(k => (o_ank.PHONE_MOBILE != null && k.PHONE == o_ank.PHONE_MOBILE) ||
                                                       (o_ank.PHONE_HOME != null && k.PHONE == o_ank.PHONE_HOME))
                                                 .ToList();

        foreach (var hidedKont in hidedKontact) {
          hidedKont.SKR = 2;
          hidedKont.O_ANK_ID = o_ank.ID;  // указываем в контакте ссылку на соответствующую реальную анкету
        }

        // скрытие для рекомендованных
        var hidenRek = db.O_REK_ANK.Where(k => (o_ank.PHONE_MOBILE != null && k.PHONE == o_ank.PHONE_MOBILE) ||
                                (o_ank.PHONE_HOME != null && k.PHONE == o_ank.PHONE_HOME)).ToList();

        foreach(var hidedKont in hidenRek) {
          hidedKont.SKR = 2;
          hidedKont.O_ANK_ID = o_ank.ID;  //указываем в контакте ссылку на соответтствующую реальную анкету

          // человеку, который пригласил данного клиента
          // надо проставить в анкете признак - Активист
          O_ANK ank1 = db.O_ANK.Find(hidedKont.O_ANK_ID_REK);
          if(ank1 == null) {
            throw new Exception("Не найдена анкета с ID =  " + hidedKont.O_ANK_ID_REK + " (рекомендующий клиент)");
          }
          ank1.AKTIVIST = 1;

        }

        db.SaveChanges();

      }

    }



    // сохранение анкеты
    [HttpPost]
    public ActionResult NewAnkSave(O_ANK o_ank, string base64Photo, IList<O_ANK_ZABOL> o_ank_zabol, O_SEANS o_seans, int? ist_inf_userid) {

      UserContext uc = GetUserContext();

      DateTimeToUniversalTime(o_ank);

      o_ank.SURNAME = Capitalize(o_ank.SURNAME);
      o_ank.NAME = Capitalize(o_ank.NAME);
      o_ank.SECNAME = Capitalize(o_ank.SECNAME);

      o_ank.M_ORG_ID = uc.M_ORG_ID;
      DateTime now = CreateDate();


      using(ATLANTEntities db = new ATLANTEntities()) {


        // если используется штрих-код, надо проверить, не присвоен ли он кому-то ещё
        int cntID_CODE = db.O_ANK.Where(x => x.ID != o_ank.ID && x.ID_CODE == o_ank.ID_CODE).Count();
        if (cntID_CODE > 0) {
          return Content(JsonConvert.SerializeObject(new { success = "false", message = "Данный штрих-код уже использовался" }), "application/json");
        }


        // проверяю, есть ли человек с таким телефоном среди контактов
        if (o_ank.PHONE_HOME != null || o_ank.PHONE_MOBILE != null) {

          var kont = db.O_KONT_ANK.Where(x => x.M_ORG_ID == uc.M_ORG_ID
                                              && (o_ank.PHONE_HOME != null && x.PHONE == o_ank.PHONE_HOME
                                                  ||
                                                  o_ank.PHONE_MOBILE != null && x.PHONE == o_ank.PHONE_MOBILE))
                                  .FirstOrDefault();

          // если есть, то Источник информации должен быть Сотрудник
          if (kont != null) {

            if (o_ank.IST_INFO != M_IST_INFO_SOTRUDNIK) {
              return Json(new { success = "false", message = "С указанным телефоном найдена запись в режиме Контакты, необходимо изменить Источник информации в текущей анкете на \"Сотрудник\""});
            } else {
              // переписываем пользователя
              if (ist_inf_userid.HasValue){
                if ((kont.D_START.Value.AddDays(7) > now) && (kont.USERID != ist_inf_userid)) {
                  return Json(new { success = "false", message = "Для изменения сотрудника, который ввел контакт, должна пройти неделя со дня ввода контакта" });
                }

                O_KONT_ANK k = kont;
                k.USERID = ist_inf_userid;
                db.Entry(kont).CurrentValues.SetValues(k);
              }
            }

          // если нет, то Источник информации не может быть Сотрудник
          } else {

            if (o_ank.IST_INFO == M_IST_INFO_SOTRUDNIK) {
              return Json(new { success = "false", message = "С указанным телефоном не найдена запись в режиме Контакты, необходимо изменить Источник информации в текущей анкете на любое значение кроме \"Сотрудник\""});
            }

          }

        }



        // фото передается как base64, сначала декодирую
        if (!String.IsNullOrEmpty(base64Photo)) {
          o_ank.PHOTO = Convert.FromBase64String(base64Photo);
        }





		    // пытаемся найти анкету с таким же мобильным номером 
        //    1. в текущей организации
        //    2. и среди всех организаций, 
        // если в текущей организации есть анкета с таким номером,
        // то выдаём ошибку, а если с таким номером есть в другой организации,
        // это значит пришёл клиент из другого салона, анкета сохраняется, но добавляется
        // информация в режим Оповещения, чтобы с этой ситуацией разобрались
        //
        // оповещение, если клиент уже есть в другом салоне
        O_OPOV opov = null;
        if (o_ank.PHONE_MOBILE != null) {

          var samePhone = db.O_ANK.Where(x => x.PHONE_MOBILE == o_ank.PHONE_MOBILE && x.ID != o_ank.ID).ToList();
		      var existAnk = samePhone.Where(x => x.M_ORG_ID == uc.M_ORG_ID).ToList();

		      if (existAnk != null && existAnk.Count > 0) {
			      return Json(new { success = "false", 
                              message = "Ошибка при сохранении анкеты. Анкета с указанным номером мобильного телефона уже существует"});
		      }

          var drugayaOrg = samePhone.Where(x => x.M_ORG_ID != uc.M_ORG_ID).FirstOrDefault();
          if (drugayaOrg != null) {
            // добавляю Оповещение
            opov = new O_OPOV() {
              ID = 0,  // задаётся ниже, непосредственно при добавлении
              D_START = now,
              D_MODIF = null,
              M_ORG_ID = uc.M_ORG_ID,
              M_ORG_ID_SOURCE = drugayaOrg.M_ORG_ID,
              USERID = uc.ID,
              O_ANK_ID = 0, // пока не знаю ИД анкеты, задаётся ниже
              O_ANK_ID_SOURCE = drugayaOrg.ID,
              O_SKLAD_RAS_ID = null, // в этом типе оповещения не учитывается 
              O_SKLAD_RAS_PRODUCT_ID = null, // в этом типе оповещения не учитывается
              TIP = O_OPOV_TIP_CHUJOY_KLIENT
            };
          }
        }



        // Сохранение анкеты
        //
        // новая анкета
        if(o_ank.ID == 0) {

          o_ank.GPS_LT = null;
          o_ank.GPS_LG = null;

          var id = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_ANK_ID as int)").First();
          o_ank.ID = id;

          // если пользоатель не указал особый штрих-код, то он проставляется из ID анкеты
          if (o_ank.ID_CODE == 0) {
            o_ank.ID_CODE = o_ank.ID;
          }

          db.O_ANK.Add(o_ank);

          db.SaveChanges();

          // выбранные заболевания
          if (o_ank_zabol != null) {

				    foreach(var item in o_ank_zabol) {
				      item.O_ANK_ID = id;
              item.M_ORG_ID = uc.M_ORG_ID;
				    }

				    db.O_ANK_ZABOL.AddRange(o_ank_zabol);
			    }

          db.SaveChanges();

          // если в новой анкете есть источник информации,
          // но нет записи в O_REK_ANK, создаем автоматом
          if (o_ank.FIO_INFO_ID != null) {
            int ID = o_ank.FIO_INFO_ID.Value;
            var rek_ank = db.O_ANK.Find(ID);

            if (rek_ank != null) {
              var rek = db.O_REK_ANK.Where(x => x.PHONE == (o_ank.PHONE_MOBILE ?? o_ank.PHONE_HOME) && x.O_ANK_ID_REK == rek_ank.ID).FirstOrDefault();
              if (rek == null) {
                O_REK_ANK r = new O_REK_ANK {
                  D_START = now,
                  M_ORG_ID = uc.M_ORG_ID,
                  NAME = o_ank.NAME,
                  O_ANK_ID = o_ank.ID,
                  PHONE = (o_ank.PHONE_MOBILE ?? o_ank.PHONE_HOME),
                  SECNAME = o_ank.SECNAME,
                  SURNAME = o_ank.SURNAME,
                  SKR = 2,
                  USERID = uc.ID,
                  O_ANK_ID_REK = rek_ank.ID // кто его рекомендует
                };

                rek_ank.AKTIVIST = 1;
                db.O_REK_ANK.Add(r);
                db.SaveChanges();
              }
            }

          }

          // сохраняем анкету
          db.SaveChanges();

          // сохраняем действие
          O_DEISTV deistvAnkCreated = new O_DEISTV();
          deistvAnkCreated.O_ANK_ID = id;
          deistvAnkCreated.M_DEISTV_ID = M_DEISTV_ANKETA;
          deistvAnkCreated.MESS = uc.UserName + " Создал(а) новую анкету ФИО: " + (o_ank.SURNAME ?? "") + " " + (o_ank.NAME ?? "") + " " + (o_ank.SECNAME ?? "") +
                    " моб. телефон " + (o_ank.PHONE_MOBILE ?? "");
          SaveDeistv(deistvAnkCreated);

          if (o_ank.ID != o_ank.ID_CODE) {
            O_DEISTV deistvNewAnkID_CODEChanged = new O_DEISTV() {
              D_START = CreateDate(),
              M_ORG_ID = uc.M_ORG_ID,
              USERID = uc.ID,
              O_ANK_ID = o_ank.ID,
              M_DEISTV_ID = M_DEISTV_SHTRIH_KOD,
              MESS = uc.UserName + " Зарегистрировал(а) в анкете " + (o_ank.SURNAME ?? "") + " " + (o_ank.NAME ?? "") + " " + (o_ank.SECNAME ?? "") +
                      " моб. телефон " + (o_ank.PHONE_MOBILE ?? "") + " код " + o_ank.ID_CODE.ToString()
            };
            SaveDeistv(deistvNewAnkID_CODEChanged);
          }


        // редактирование анкеты
        } else {

          O_ANK dbAnk = db.O_ANK.Find(o_ank.ID);

          if (dbAnk == null) {
            return HttpNotFound();
          }

          // на всякий случай проверяю, что ID_CODE (штрих-код) проставлен, он обязателен к заполнению и при
          // редактировании всегда должен быть, поэтому его отсутствие означает какую-то серьёзную ошибку
          if (o_ank.ID_CODE == 0) {
            throw new Exception("Field O_ANK.ID_CODE cannot be null or 0, failed to save O_ANK");
          }

          // считаю, что адрес мог поменяться, чтобы не заниматься долгим
          // сравнением просто обнуляю GPS координаты клиента, они будут
          // переполучены при следующем обращении к отчету Карта
          dbAnk.GPS_LT = null;
          dbAnk.GPS_LG = null;



          O_DEISTV o = new O_DEISTV();
          o.O_ANK_ID = dbAnk.ID;
          o.M_DEISTV_ID = M_DEISTV_ANKETA; // действие с анкетой

          if (o_ank.PHONE_MOBILE != dbAnk.PHONE_MOBILE) {
            o.MESS = uc.UserName + " Изменил(а) в анкете " + (o_ank.SURNAME ?? "") + " " + (o_ank.NAME ?? "") + " " + (o_ank.SECNAME ?? "") +
                     " моб. телефон: было " + (dbAnk.PHONE_MOBILE ?? "") + ", стало " + (o_ank.PHONE_MOBILE ?? "");
          }

          if (o_ank.PHONE_HOME != dbAnk.PHONE_HOME) {
            if (o.MESS != null) {
              o.MESS += ", дом. телефон: было " + (dbAnk.PHONE_HOME ?? "") + ", стало " + (o_ank.PHONE_HOME ?? "");
            } else {
              o.MESS = uc.UserName + " Изменил(а) в анкете " + (o_ank.SURNAME ?? "") + " " + (o_ank.NAME ?? "") + " " + (o_ank.SECNAME ?? "") +
                       " дом. телефон: было " + (dbAnk.PHONE_HOME ?? "") + ", стало " + (o_ank.PHONE_HOME ?? "");
            }
          }




          // изменили штрих-код
          O_DEISTV deistvID_CODEChanged = new O_DEISTV();
          if (dbAnk.ID_CODE != o_ank.ID_CODE) {
            deistvID_CODEChanged = new O_DEISTV() {
              D_START = CreateDate(),
              M_ORG_ID = uc.M_ORG_ID,
              USERID = uc.ID,
              O_ANK_ID = o_ank.ID,
              M_DEISTV_ID = M_DEISTV_SHTRIH_KOD,
              MESS = uc.UserName + " Изменил(а) в анкете " + (o_ank.SURNAME ?? "") + " " + (o_ank.NAME ?? "") + " " + (o_ank.SECNAME ?? "") +
                      " моб. телефон " + (o_ank.PHONE_MOBILE ?? "") + " код с " + dbAnk.ID_CODE.ToString() + " на " + o_ank.ID_CODE.ToString()
            };

          }

          db.Entry(dbAnk).CurrentValues.SetValues(o_ank);

          // выбранные заболевания
          if (o_ank_zabol != null) {

            foreach(var item in o_ank_zabol) {
              item.O_ANK_ID = o_ank.ID;
              item.M_ORG_ID = uc.M_ORG_ID;
            }
          
            // если пользователь удалил
            foreach(O_ANK_ZABOL z in db.O_ANK_ZABOL.Where(x => x.O_ANK_ID == o_ank.ID)) {
              if (!o_ank_zabol.Any(x => x.ID == z.ID)) {
                db.Entry(z).State = System.Data.Entity.EntityState.Deleted;
              }
            }

            // если пользователь отредактировал
            // ... такого нет, т.к. это таблица связей

            // если пользователь добавил
            foreach(O_ANK_ZABOL z in o_ank_zabol) {
              if (z.ID == 0) {
                z.M_ORG_ID = uc.M_ORG_ID;
                db.O_ANK_ZABOL.Add(z);
              }
            }

          // всё удалили или ничего не было
          } else {
          
            foreach(O_ANK_ZABOL item in db.O_ANK_ZABOL.Where(n => n.O_ANK_ID == dbAnk.ID)) {
              db.O_ANK_ZABOL.Remove(item);
            }  

          }

          // сохраняем анкету
          db.SaveChanges();

          // сохраняем действие
          if (o.MESS != null) {
            SaveDeistv(o);
          }

          if (deistvID_CODEChanged.MESS != null) {
            SaveDeistv(deistvID_CODEChanged);
          }

        }
        // /сохранение анкеты




        // на этом этапе анкета уже сохранена, не важно была ли она добавлена или отредактирована




        // если нужно добавить оповещение
        if (opov != null) {
          // если такого оповещения ещё не было
          var op = db.O_OPOV.Where(x => x.TIP == O_OPOV_TIP_CHUJOY_KLIENT && 
                                        x.M_ORG_ID == uc.M_ORG_ID && 
                                        x.O_ANK_ID == o_ank.ID).FirstOrDefault();
          if (op == null) {
            opov.ID = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_OPOV_ID as int)").First();
            opov.O_ANK_ID = o_ank.ID;
            db.O_OPOV.Add(opov);
            db.SaveChanges();
          }
        }



			  // при сохранении анкеты скрываем соответствующий контакт, если есть
			  HideKont(o_ank);

        // возвращаю полностью переполученную анкету, чтобы потом отобразить
        // в интерфейсе вместе с идентификатором и другими полями
        O_ANKViewModel o_ankVM = GetAnk(ID: o_ank.ID);

        // регистрация на сеанс
        if (o_seans != null) {

          // зарегистрировать можно только новенького,
          // который не зарегистрирован на сегодня
          // не посажен на ряд сегодня
          // и не записан на сегодня
          if ((o_ank.DATE_REG.HasValue) && o_ank.DATE_REG.Value.Date == now.Date &&
              db.O_SEANS.Where(x => x.O_ANK_ID == o_ank.ID &&
                                    (DbFunctions.TruncateTime(x.D_REG) == now.Date ||
                                     DbFunctions.TruncateTime(x.D_START) == now.Date ||
                                     DbFunctions.TruncateTime(x.SEANS_DATE) == now.Date))
                              .Count() == 0) {

            // проверяю, что выбранное место и время ещё не занято
            var r = db.O_SEANS.Where(x => x.SEANS_STATE == SEANS_STATE_SOSTOYALSYA && 
                                          (DbFunctions.TruncateTime(x.D_REG) == now.Date || 
                                                 DbFunctions.TruncateTime(x.D_START) == now.Date) &&
                                          x.M_SEANS_PLACE_ID == o_seans.M_SEANS_PLACE_ID &&
                                          x.M_SEANS_TIME_ID == o_seans.M_SEANS_TIME_ID).Count();
                                        
            if (r > 0) {

              o_ankVM.reg_error = "Ошибка при регистрации на сеанс. Выбранное место и время уже занято. Выберите другое.";
            
            } else {

              o_seans.BEZ_REG = 0;  
              o_seans.D_REG = now;
              o_seans.D_START = now;
              o_seans.LANE = 0;
              o_seans.M_ORG_ID = uc.M_ORG_ID;
              o_seans.O_ANK_ID = o_ank.ID;
              o_seans.SEANS_DATE = null;
              o_seans.SEANS_STATE = SEANS_STATE_SOSTOYALSYA;
              o_seans.USERID = uc.ID;
              o_seans.USERID_REG = uc.ID;
              o_seans.ANK = 1;
              o_seans.D_MODIF = now;

              // если это регистрация (только что созданной) анкеты по существующему
              // контакту, то в создаваемый сеанс надо проставить признак
              int cnt = db.O_KONT_ANK.Where(x => x.O_ANK_ID == o_ank.ID).Count();
              if (cnt > 0) {
                o_seans.IS_FIRST_KONT_SEANS = 1;
              }

              db.O_SEANS.Add(o_seans);

              db.SaveChanges();

              // проставляю признак, чтобы в интерфейсе после переполучения
              // анкеты скрылась возможность зарегистрировать на сеанс ещё раз
              o_ankVM.reg_status = "Уже зарегистрирован на сегодня " + db.M_SEANS_TIME.Find(o_seans.M_SEANS_TIME_ID).NAME;

            }

          } else {

            o_ankVM.reg_error = "Ошибка при регистрации на сеанс. Регистрировать из Анкеты можно только новеньких, которые не были зарегистрированы на текущий день.";

          }


        }

		    return Content(JsonConvert.SerializeObject(new { success = "true", data = new { data = o_ankVM } }), "application/json");

    	}

    }


    public ActionResult NewZvonok() {
        ViewBag.Message = "Your contact page.";

        return View();
    }

    [HttpGet]
    public JsonResult GetDialogData(int ID) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from a in db.O_DIALOG where (a.O_ANK_ID == ID)
        select
             new {
               a.ID,
               a.O_ANK_ID,
               a.COMMENT,
               a.NPOS
             };
        return Json(d.ToList().OrderByDescending(x => x.ID), JsonRequestBehavior.AllowGet);
      }
    }

    [HttpGet]
    public JsonResult GetStatusData(int ID) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from a in db.O_STATUS
                where (a.O_ANK_ID == ID)
                select
                     new {
                       a.ID,
                       a.M_STATUS_ID,
                       a.M_PRODUCT_ID,
                       STATUS_DATE = a.STATUS_DATE.Value.Year.ToString() + "-" +
                                     a.STATUS_DATE.Value.Month.ToString() + "-" +
                                     a.STATUS_DATE.Value.Day.ToString()
                     };
        return Json(d.ToList(), JsonRequestBehavior.AllowGet);
      }
    }

		[HttpGet]
		public JsonResult GetComplaintData(int ID) {
			using (ATLANTEntities db = new ATLANTEntities()) {
				var d = from a in db.O_COMPLAINT
								where (a.O_ANK_ID == ID)
								select
										 new {
											 a.ID,
											 a.O_ANK_ID,
											 a.COMMENT
										 };
        
				return Json(d.ToList(), JsonRequestBehavior.AllowGet);
			}
		}

		[HttpPost]
    public JsonResult DialogSave(O_DATA ank) {

      string message = "true", data = "true";

      using (ATLANTEntities db = new ATLANTEntities()) {
        UserContext uc = GetUserContext();
        int exists = 0;

        // для удаления записей, которые есть на сервере, но, возможно, были удалены на клиенте
        var statusIdsBase = db.O_STATUS.Where(a => a.O_ANK_ID == ank.ID).ToList();
        var dialogIdsBase = db.O_DIALOG.Where(a => a.O_ANK_ID == ank.ID).ToList();

        DateTime now = CreateDate();

        // сохраняем общение
        if (ank.O_DIALOG != null) {
          foreach (var c in ank.O_DIALOG) {
            // если передан Ид сеанса, надо проверить, что он существует
            if (c.O_SEANS_ID.HasValue) {
              if (db.O_SEANS.Where(b => b.ID == c.O_SEANS_ID).FirstOrDefault() == null) {
                message = "no seans";
                break;
              }
            }

            // новые записи
            if (c.ID == -1) {
              var visits = db.O_SEANS.Where(a => a.O_ANK_ID == ank.ID &&
                                                 DbFunctions.TruncateTime(a.D_REG) <= now.Date &&
                                                 a.SEANS_STATE == SEANS_STATE_SOSTOYALSYA &&
                                                 a.M_ORG_ID == uc.M_ORG_ID).ToList();
              var count = visits.Count;
              O_DIALOG o = new O_DIALOG();
              o.O_ANK_ID = ank.ID;
              o.COMMENT = c.COMMENT;
              o.USERID = uc.ID;
              o.M_ORG_ID = uc.M_ORG_ID;
              o.O_SEANS_ID = c.O_SEANS_ID;
              o.DIALOG_DATE = now;
              o.NPOS = count.ToString() + " " + getDateddMMyyyyStr(now) + " " + getTimehhMMStr(now) + " " + (uc.SURNAME ?? "") + " " + (uc.NAME ?? "");
              db.O_DIALOG.Add(o);

              // сохраняем действие
              O_DEISTV d = new O_DEISTV();
              var e = db.O_ANK.Find(ank.ID);
              if (e != null) {
                
                d.MESS = uc.UserName + " Добавил(а) в анкете " + (e.SURNAME ?? "") + " " + (e.NAME ?? "") + " " + (e.SECNAME ?? "") + 
                                       " комментарий '" + c.COMMENT + "'";
                d.O_ANK_ID = ank.ID;
                d.M_DEISTV_ID = 2; // Общение
                d.D_START = CreateDate();
                d.M_ORG_ID = uc.M_ORG_ID;
                d.USERID = uc.ID;
                db.O_DEISTV.Add(d);
              }

            }
          }
        }

        // статусы
        if (ank.O_STATUS != null) {
          foreach (var stat in ank.O_STATUS) {
            if (stat.STATUS_DATE.HasValue) {
              stat.STATUS_DATE = stat.STATUS_DATE.Value.ToUniversalTime();
            }
          }

          foreach (var c in ank.O_STATUS) {
            if (c.ID == -1) {
              O_STATUS o = new O_STATUS();
              o.O_ANK_ID = ank.ID;
              o.M_STATUS_ID = c.M_STATUS_ID;
              o.M_PRODUCT_ID = c.M_PRODUCT_ID;
              o.STATUS_DATE = c.STATUS_DATE;
              o.USERID = uc.ID;
              o.M_ORG_ID = uc.M_ORG_ID;
              db.O_STATUS.Add(o);

              // сохраняем действие
              O_DEISTV d = new O_DEISTV();
              var a = db.O_ANK.Find(ank.ID);
              if (a != null) {
                var b = db.M_STATUS.Find(c.M_STATUS_ID);
                var x = db.M_PRODUCT.Find(c.M_PRODUCT_ID);
                if (b != null) {
                  if (x != null) {
                    d.MESS = uc.UserName + " Добавил(а) в анкете " + (a.SURNAME ?? "") + " " + (a.NAME ?? "") + " " + (a.SECNAME ?? "") +
                                           " статус '" + (b.NAME ?? "") + "' товар '" + (x.NAME ?? "") + "'";
                    d.O_ANK_ID = ank.ID;
                    d.M_DEISTV_ID = 2; // Общение
                    d.D_START = CreateDate();
                    d.M_ORG_ID = uc.M_ORG_ID;
                    d.USERID = uc.ID;
                    db.O_DEISTV.Add(d);
                  }
                }
              }
            } else {
						  // возможно, что-то поменялось
						  c.O_ANK_ID = ank.ID;
						  var u = db.O_STATUS.Find(c.ID);

              // сохраняем действие
              O_DEISTV d = new O_DEISTV();
              var a = db.O_ANK.Find(ank.ID);
              if (a != null) {
                if (c.M_STATUS_ID != u.M_STATUS_ID) {
                  var b = db.M_STATUS.Find(c.M_STATUS_ID);
                  var y = db.M_STATUS.Find(u.M_STATUS_ID);

                  var x = db.M_PRODUCT.Find(c.M_PRODUCT_ID);
                  if (b != null && y != null) {
                    if (x != null) {
                      d.MESS = uc.UserName + " Изменил(а) в анкете " + (a.SURNAME ?? "") + " " + (a.NAME ?? "") + " " + (a.SECNAME ?? "") +
                                             " статус c '" + (y.NAME ?? "") + "' на '" + (b.NAME ?? "") + "', товар '" + (x.NAME ?? "") + "'";
                      d.O_ANK_ID = ank.ID;
                      d.M_DEISTV_ID = 2; // Общение
                      d.D_START = CreateDate();
                      d.M_ORG_ID = uc.M_ORG_ID;
                      d.USERID = uc.ID;
                      db.O_DEISTV.Add(d);
                    }
                  }
                }
              }

              c.M_ORG_ID = uc.M_ORG_ID;
              c.USERID = uc.ID;
              db.Entry(u).CurrentValues.SetValues(c);
            }
          }
        }

				// жалобы
        if (ank.O_COMPLAINT != null) {
				  foreach (var c in ank.O_COMPLAINT) {  // ID=0, для отображения поля ввода, -1-новая запись, сохраняем
					  if (c.ID == -1) {
						  O_COMPLAINT o = new O_COMPLAINT();
						  o.O_ANK_ID = ank.ID;
						  o.COMMENT = c.COMMENT;
              o.D_START = now;
              o.M_ORG_ID = uc.M_ORG_ID;
              o.USERID = uc.ID;
						  db.O_COMPLAINT.Add(o);
					  } else {
						  // возможно, что-то поменялось
              var p = db.O_COMPLAINT.AsNoTracking().Where(x => x.ID == c.ID).FirstOrDefault();
              p.D_MODIF = now;
              p.COMMENT = c.COMMENT;
						  var u = db.O_COMPLAINT.Find(c.ID);
						  db.Entry(u).CurrentValues.SetValues(p);
					  }
				  }
        }

				db.SaveChanges();

        // записи после сохранения
        var statusIdsClient = db.O_STATUS.Where(a => a.O_ANK_ID == ank.ID).ToList();
        var dialogIdsClient = db.O_DIALOG.Where(a => a.O_ANK_ID == ank.ID).ToList();

        // проходим по каждой записи - статусы
        foreach (var server in statusIdsBase) {
          foreach (var client in statusIdsClient) {
            if (server.ID == client.ID) {
              exists = 1;
            }
          }
          if (exists == 0) {
            var q = db.O_STATUS.Find(server.ID);
            db.O_STATUS.Remove(q);
          }
          exists = 0;
        }

        db.SaveChanges();

        // общение
        foreach (var server in dialogIdsBase) {
          foreach (var client in dialogIdsClient) {
            if (server.ID == client.ID) {
              exists = 1;
            }
          }
          if (exists == 0) {
            var q = db.O_DIALOG.Find(server.ID);
            db.O_DIALOG.Remove(q);
          }
          exists = 0;
        }

        db.SaveChanges();
      }
      return Json(new { success = message, data = data });
    }


    public JsonResult SearchSurname(String term) {

       using (ATLANTEntities db = new ATLANTEntities()) {
         M_SURNAME res = db.M_SURNAME.Where(x => x.SURNAME.StartsWith(term.ToUpper()) &&
                                                 !x.SURNAME.Equals(term.ToUpper()))
                     .OrderBy(x => x.SURNAME)
                     .Take(1).FirstOrDefault()
         ;
         if (res == null) {
           res = new M_SURNAME {SURNAME = ""};
         }
         return Json(res, JsonRequestBehavior.AllowGet);
       }
    }


    // данные для режима Статистика
    public ContentResult GetAnkData(int ID) {
      AnkData d = new AnkData();

      DateTime now = CreateDate();

      using (ATLANTEntities db = new ATLANTEntities()) {
        List<int> checkValues = new List<int> { 2, 3, 4 };
        var ank = db.O_ANK.Where(a => a.ID == ID).FirstOrDefault();
        if (ank != null) {
          if (ank.BIRTHDAY != null) {
						d.birth_day = ank.BIRTHDAY.Value.Day.ToString() + " " +
													arrayMonth[ank.BIRTHDAY.Value.Month - 1] + " " +
													ank.BIRTHDAY.Value.Year + " года";

						DateTime dtStart = ank.BIRTHDAY.Value;
            DateTime dtEnd = now;
            if (dtEnd < dtStart) {
              DateTime f = dtEnd;
              dtEnd = dtStart;
              dtStart = f;
            }
            DateTime g = new DateTime((dtEnd - dtStart).Ticks);
            d.age = Sklonenie(g.Year - 1, year);
            d.birth = getDateddMMyyyyStr(ank.BIRTHDAY);
          } else {
            d.age = "";
						d.birth_day = "не заполнено в анкете";
          }

          var k = db.O_KONT_ANK.Where(a => a.O_ANK_ID == ank.ID).FirstOrDefault();
          if (k != null) {
            DateTime dtStart = k.D_START.Value;
            DateTime dtEnd = now;
            if (dtEnd < dtStart) {
              DateTime f = dtEnd;
              dtEnd = dtStart;
              dtStart = f;
            }
            DateTime g = new DateTime((dtEnd - dtStart).Ticks);
            // длительность контакта
            d.contact = Sklonenie(g.Year - 1, year);
            d.contact += " " + Sklonenie(g.Month - 1, month);
            d.contact += " " + Sklonenie(g.Day - 1, day);
            // кол-во месяцев в периоде
            d.cycle = string.Format("{0}", g.Month - 1);
            // кто занес
            var p = db.S_USER.Where(a => a.ID == k.USERID).FirstOrDefault();
            if (p != null) {
              d.contact_fio = (p.SURNAME ?? "") + " " + (p.NAME ?? "") + " " + (p.SECNAME ?? "");
            }
          }

          var s = db.Database.SqlQuery<DialogInfo>("EXEC [dbo].[GET_DIALOG_INFO] {0}", ank.ID).ToList();
          
          if (s != null) {
            d.first_visit = s[0].first_visit;
            d.last_visit = s[0].last_visit;
            d.all_visits = s[0].visits.ToString();
            d.nepreryv = s[0].nepreryv;
            d.zabol = s[0].zabol;
          }

          d.subdate = now.Day.ToString() + " " + arrayMonth[now.Month - 1] + " " + getTimehhMMStr(now);
          var u = db.S_USER.Find(ank.USER_REG);
          if (u != null) {          
            d.fio_reg = (u.SURNAME ?? " ") + " " + (u.NAME ?? " ") + " " + (u.SECNAME ?? "");
          }

          d.phone = ((ank.PHONE_MOBILE != null ? ank.PHONE_MOBILE : ank.PHONE_HOME) ?? "");
          d.surname = (ank.SURNAME ?? "");
          d.name = (ank.NAME ?? "");
          d.secname = (ank.SECNAME ?? "");
          d.fio = d.surname + " " + d.name + " " + d.secname;

          // Посещения по датам
          List<StatPos> posListTemp = execGET_ABON_POS_LIST(ank.ID);
          // даты повторяются по количеству доп. услуг, например
          /*
            2018-03-22	Абон.  1 мес: 1, 	Нефритовая маска: 1 
            2018-03-22	Абон.  1 мес: 1, 	Кружка-фильтр: 1 
            2018-03-21	Абон.  1 мес: 1, 	Кружка-фильтр: 1 
          */
          // посещения по основному абонементу всё время повторяются, а по доп. услугам - разные, складываю это в одну строку
          List<StatPos> posList = new List<StatPos>();
          if (posListTemp.Count > 0) {
            StatPos prevPos = posListTemp[0];
            prevPos.str_kolvo = prevPos.str_kolvo_osn + prevPos.str_kolvo_dop;
            posList.Add(prevPos);
            posListTemp.Remove(prevPos);
            posListTemp.ForEach(x => {
              if (x.d_pos == prevPos.d_pos) {
                prevPos.str_kolvo = prevPos.str_kolvo + x.str_kolvo_dop;
              } else {
                x.str_kolvo = x.str_kolvo_osn + x.str_kolvo_dop;
                posList.Add(x);
                prevPos = x;
              }
            });
          }

          // Приостановки абонемента
          List<StatPriost> priostList =
            db.O_ABON_PRIOST
              .Where(x => x.O_ANK_ID == ank.ID)
              .ToList()
              .Select(x =>
                  new StatPriost() {
                    d_priost_s = x.D_PRIOST_S,
                    d_priost_po = x.D_PRIOST_PO,
                    kolvo_dn = (x.D_PRIOST_S.HasValue && x.D_PRIOST_PO.HasValue) ? ((x.D_PRIOST_PO.Value - x.D_PRIOST_S.Value).Days + 1) : 0
                  }
              )
              .OrderByDescending(x => x.d_priost_s)
              .ToList();


          d.posList = posList;
          d.priostList = priostList;
        }
      }
      return Content(JsonConvert.SerializeObject(d), "application/json");
    }


    // получить список посещений по абонементу, где будут даты посещений, основной абонемент и доп. услуги
    // даты будут повторяться, если много доп. услуг, сколько доп. услуг, столько и повторений
    private List<StatPos> execGET_ABON_POS_LIST(int o_ank_id) {
      using(ATLANTEntities db = new ATLANTEntities()) {
        SqlParameter pO_ank_id = new SqlParameter("@o_ank_id", SqlDbType.Int);
        pO_ank_id.Value = o_ank_id;
        return db.Database.SqlQuery<StatPos>("exec dbo.[GET_ABON_POS_LIST] @o_ank_id = @o_ank_id;", pO_ank_id).ToList();
      }
    }



    public string Sklonenie(int num, string[] name) {
      List<int> checkValues = new List<int> { 2, 3, 4 };
      string res = "";
      if ((num == 1) || (num % 10 == 1)) {
        res = string.Format("{0} " + name[0], num); // день, месяц, год
      }

      if ((checkValues.Contains(num)) || (checkValues.Contains(num % 10))) {
        res = string.Format("{0} " + name[1], num); // дня, месяца, года
      }

      if ((num == 5) || (num % 10 >= 5) || (num > 10 && num < 21)) {
        res = string.Format("{0} " + name[2], num); // дней, месяцев, лет
      }
      return res;
    }

    // Получение списка причин исключения
    public JsonResult GetM_PRICH_ISKL()
    {
      using (ATLANTEntities db = new ATLANTEntities())
      {
        var d = from item in db.M_PRICH_ISKL
                select
                    new
                    {
                      item.ID,
                      item.NAME
                    };
        return Json(d.ToList(), JsonRequestBehavior.AllowGet);
      }
    }

    // Получение списка шаблонов
    public JsonResult GetShablonData() {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from shablon in db.M_SHABLON
                where shablon.M_ORG_ID == uc.M_ORG_ID
                select
                    new
                        {
                        shablon.ID,
                        shablon.SHABLON_NAME,
                        shablon.SHABLON_TEXT
                        };
        return Json(d.ToList(), JsonRequestBehavior.AllowGet);
      }
    }


    // получение списка организаций
    // либо одной организации, если передан ID
    [HttpGet]
    public ContentResult GetM_ORG(int? ID)
    {
      using (ATLANTEntities db = new ATLANTEntities())
      {
        IQueryable<M_ORG> d;
        if (ID == null) {
          d = from item in db.M_ORG where item.DEISTV == 1 select item;
        } else {
          d = from item in db.M_ORG where item.ID == ID select item;
        }
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }


    // получение списка типов организаций (Дилер A, Дилер C)
    [HttpGet]
    public ContentResult GetM_ORG_TYPE()
    {
      using (ATLANTEntities db = new ATLANTEntities())
      {
        var d = from item in db.M_ORG_TYPE select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }


    // получение списка групп прав
    [HttpGet]
    public ContentResult GetM_PRAVO_GR()
    {
      using (ATLANTEntities db = new ATLANTEntities())
      {
        var d = from item in db.M_PRAVO_GR select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    // получение списка прав для режимов
    [HttpGet]
    public ContentResult GetM_PRAVO_REJ()
    {
      using (ATLANTEntities db = new ATLANTEntities())
      {
        var d = from item in db.M_PRAVO_REJ select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    // получение справочника групп заболеваний
    [HttpGet]
    public ContentResult GetM_ZABOL_GROUP() {
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from item in db.M_ZABOL_GROUP select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    // получение справочника специалисты
    [HttpGet]
    public ContentResult GetS_USER_ROLE() {
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from item in db.S_USER_ROLE select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    // получение справочника виды сервиса
    [HttpGet]
    public ContentResult GetM_SERVICE_TYPE() {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from item in db.M_SERVICE_TYPE.
                Where(x => 
                      (x.ID <= 3 && uc.M_ORG_TYPE_ID != M_ORG_TYPE_ID_TEH_OTDEL) ||
                      (uc.M_ORG_TYPE_ID == M_ORG_TYPE_ID_TEH_OTDEL))
                select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    // получение справочника виды обрудования
    [HttpGet]
    public ContentResult GetM_PRODUCT() {
      using (ATLANTEntities db = new ATLANTEntities()) {
        UserContext uc = GetUserContext();
        var m = db.M_PRODUCT_ORG.Where(x => x.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();

        if (m == null) {
          var d = from item in db.M_PRODUCT select item;
          return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
        } else {
          var d = from item in db.M_PRODUCT
                  from prod in db.M_PRODUCT_ORG.Where(u => u.M_PRODUCT_ID == item.ID).DefaultIfEmpty()
                  where prod.M_ORG_ID == uc.M_ORG_ID
                  select item;

          return Content(JsonConvert.SerializeObject(d.ToList().OrderBy(o => o.ID)), "application/json");
        }
      }
    }

    // получение справочника группы обрудования
    [HttpGet]
    public ContentResult GetM_RYAD() {
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from item in db.M_RYAD select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    // получение справочника метод оплаты
    [HttpGet]
    public ContentResult GetM_METOD_OPL() {
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from item in db.M_METOD_OPL select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    // получение справочника статусы
    [HttpGet]
    public ContentResult GetM_STATUS() {
      using (ATLANTEntities db = new ATLANTEntities()) {
        // два статуса вперед
        var d = db.M_STATUS.Where(x => x.ID == M_STATUS_ID_POTEN_POKUP || x.ID == M_STATUS_ID_PREDOPL).ToList();

        if (d == null) {
          d = new List<M_STATUS>();
        }

        foreach (var item in db.M_STATUS.Where(x => x.ID != M_STATUS_ID_POTEN_POKUP && x.ID != M_STATUS_ID_PREDOPL)) {
          d.Add(item);
        }

        return Content(JsonConvert.SerializeObject(d), "application/json");
      }
    }

    // получение справочника статьи расхода
    [HttpGet]
    public ContentResult GetM_RASHOD_STAT() {
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from item in db.M_RASHOD_STAT select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    // получение справочника расписание сеансов
    [HttpGet]
    public ContentResult GetM_SEANS_TIME() {
      using (ATLANTEntities db = new ATLANTEntities()) {
        UserContext uc = GetUserContext();
        var d = from item in db.M_SEANS_TIME where item.M_ORG_ID == uc.M_ORG_ID select item;  // по организации
        d = d.OrderBy(a => a.MIN_TIME);
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    // получение справочника рабочих дней
    [HttpGet]
    public ContentResult GetM_WORK_DAY() {
      using (ATLANTEntities db = new ATLANTEntities()) {
        UserContext uc = GetUserContext();
        var d = from item in db.M_WORK_DAY where item.M_ORG_ID == uc.M_ORG_ID select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    // Получение справочника действий для журнала
    public ContentResult GetM_DEISTV() {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from item in db.M_DEISTV.Where(x => x.M_ORG_ID == M_ORG_ID_ADMINISTRATSIYA || x.M_ORG_ID == uc.M_ORG_ID)
                select
                    new {
                      item.ID,
                      item.NAME
                    };
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    // Получение справочника да, нет
    public ContentResult GetM_YES_NO() {
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from item in db.M_YES_NO select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    // Получение справочника вид уведомлений
    public ContentResult GetM_VID_SOB() {
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from item in db.M_VID_SOB select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    // Получение справочника вопросов, по салону
    public ContentResult GetM_VOPROS() {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from item in db.M_VOPROS where item.M_ORG_ID == uc.M_ORG_ID select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    // Получение справочника вкладок Анкета - Вопросы, по салону
    public ContentResult GetM_VOPROS_TAB() {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from item in db.M_VOPROS_TAB where item.M_ORG_ID == uc.M_ORG_ID select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    // Получение справочника Статус контакта
    public ContentResult GetM_KONT_STATUS() {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from item in db.M_KONT_STATUS select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }


    // Получение справочника Источник контакта
    public ContentResult GetM_KONT_IST() {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from item in db.M_KONT_IST select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }


    // Получение справочника Сопровождение - форма оплаты
    public ContentResult GetM_SOPR_FORM_OPL() {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from item in db.M_SOPR_FORM_OPL select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    // Получение справочника Сопровождение - продукт
    public ContentResult GetM_SOPR_PRODUCT() {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from item in db.M_SOPR_PRODUCT select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    // Получение справочника Сопровождение - статусы
    public ContentResult GetM_SOPR_STATUS() {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from item in db.M_SOPR_STATUS select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    // Сохранение шаблона
    public JsonResult SaveShablonData(M_SHABLON shablon) {

      DateTime now = CreateDate();

      UserContext uc = GetUserContext();
      shablon.M_ORG_ID = uc.M_ORG_ID;
      using (ATLANTEntities db = new ATLANTEntities()) {
        if (shablon.ID == 0) {
          shablon.D_CREATE = now;
          shablon.OPERATOR = uc.UserName;
          db.M_SHABLON.Add(shablon);
        } else {
          M_SHABLON u = db.M_SHABLON.Find(shablon.ID);
          db.Entry(u).CurrentValues.SetValues(shablon);
        }
        db.SaveChanges();
       }
       return Json(new { success = "true"});
    }

    public JsonResult DeleteShablonData(M_SHABLON shablon)
    {
      using (ATLANTEntities db = new ATLANTEntities())
      {
        M_SHABLON s = db.M_SHABLON.Where(x => x.ID == shablon.ID).FirstOrDefault();
        db.M_SHABLON.Remove(s);
        db.SaveChanges();

      }

      return Json(new { success = "true"});
    }

    // Добавить информацию о звонке
    public JsonResult GetLastZvonok(int id) {
      using (ATLANTEntities db = new ATLANTEntities()) {

        if (db.O_ZVONOK.Any(x => x.O_ANK_ID == id)) {
          var d = db.O_ZVONOK.Where(x => x.O_ANK_ID == id).Max(x => x.ID);

          var z = from a in db.O_ZVONOK
                  where (a.ID == d)
                  select new {
                    a.ID,
                    a.O_ANK_ID,
                    D_END_ISKL = a.D_END_ISKL != null ? a.D_END_ISKL.Value.Year.ToString() + "-" +
                                 a.D_END_ISKL.Value.Month.ToString() + "-" +
                                 a.D_END_ISKL.Value.Day.ToString() : null,
                    a.M_ISKL_ID
                  };
          return Json(z.ToList(), JsonRequestBehavior.AllowGet);
        } else { 
          return Json(null, JsonRequestBehavior.AllowGet);
        }
      }
    }


    // получить список анкет для вкладки "База"
    // periodHodit - фильтр Период, признак Ходит/Не ходит
    // periodDn - фильтр Период, количество дней
    // posS, posPo - Посещения с и по
    public ContentResult GetBazaList(BazaListParams p)
    {

      // количество строк на странице
      int ROWS_PER_PAGE = 14;

      if (p.periodS.HasValue) {
        p.periodS = p.periodS.Value.ToUniversalTime();
      }

      if (p.periodPo.HasValue) {
        p.periodPo = p.periodPo.Value.ToUniversalTime();
      }

      var rslt = GetBazaListData(p, ROWS_PER_PAGE);

      // если ничего не вернул запрос, то количество страниц 0
      int totalPageCount;
      if (rslt.Count == 0) {
        totalPageCount = 0;

      // если какие-то строки запрос вернул, вычисляю сколько страниц всего будет
      } else {

        int cnt = rslt.First().cnt;
        totalPageCount = cnt / ROWS_PER_PAGE;
        if (cnt % ROWS_PER_PAGE != 0) {
          totalPageCount += 1;
        }

      }

      return Content(JsonConvert.SerializeObject(new {rows = rslt, totalPageCount = totalPageCount}), "application/json");
    }


    public List<BazaListViewModel> GetBazaListData(BazaListParams p, int? rowsPerPage) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        
        if (!p.page.HasValue) {
          p.page = 1;
        }
        SqlParameter pPage = new SqlParameter("@page", p.page);
        pPage.SqlDbType = SqlDbType.Int;

        SqlParameter pRows_per_page = new SqlParameter("@rows_per_page", rowsPerPage);
        pRows_per_page.SqlDbType = SqlDbType.Int;

        SqlParameter pM_org_id = new SqlParameter("@m_org_id", GetUserContext().M_ORG_ID);
        pM_org_id.SqlDbType = SqlDbType.Int;

        if (String.IsNullOrEmpty(p.fio)) {
          p.fio = "";
        }

        SqlParameter pFio = new SqlParameter("@fio", p.fio);
        pFio.SqlDbType = SqlDbType.VarChar;


        // Посещения
        if (!p.posHodit.HasValue) {
          p.posHodit = 0;
        }

        SqlParameter pPosHodit = new SqlParameter("@posHodit", p.posHodit);
        pPosHodit.SqlDbType = SqlDbType.Int;

        if (!p.posDn.HasValue) {
          p.posDn = 0;
        }

        SqlParameter pPosDn = new SqlParameter("@posDn", p.posDn);
        pPosDn.SqlDbType = SqlDbType.Int;

        SqlParameter pPosNaDatu = new SqlParameter("@posNaDatu", DBNullOrValue(p.posNaDatu));
        pPosNaDatu.SqlDbType = SqlDbType.SmallDateTime;
        // /посещения


        if (!p.zabolId.HasValue) {
          p.zabolId = 0;
        }

        SqlParameter pZabolId = new SqlParameter("@zabolId", p.zabolId);
        pZabolId.SqlDbType = SqlDbType.Int;


        // Период
        if (!p.periodS.HasValue) {
          p.periodS = new DateTime(1900, 1, 1, 0, 0, 0, DateTimeKind.Unspecified);
        }

        SqlParameter pPeriodS = new SqlParameter("@periodS", p.periodS);
        pPeriodS.SqlDbType = SqlDbType.DateTime;

        if (!p.periodPo.HasValue) {
          p.periodPo = new DateTime(1900, 1, 1, 0, 0, 0, DateTimeKind.Unspecified);
        }

        SqlParameter pPeriodPo = new SqlParameter("@periodPo", p.periodPo);
        pPeriodPo.SqlDbType = SqlDbType.DateTime;
        // /период


        if (!p.regS.HasValue) {
          p.regS = 0;
        }

        if (!p.regPo.HasValue) {
          p.regPo = 0;
        }

        SqlParameter pRegS = new SqlParameter("@regS", p.regS);
        pRegS.SqlDbType = SqlDbType.Int;

        SqlParameter pRegPo = new SqlParameter("@regPo", p.regPo);
        pRegPo.SqlDbType = SqlDbType.Int;

        if (!p.seansId.HasValue) {
          p.seansId = 0;
        }

        SqlParameter pSeansId = new SqlParameter("@seansId", p.seansId);
        pSeansId.SqlDbType = SqlDbType.Int;

        if (String.IsNullOrEmpty(p.productIds)) {
          p.productIds = "";
        }

        SqlParameter pProductIds = new SqlParameter("@productIds", p.productIds);
        pProductIds.SqlDbType = SqlDbType.VarChar;

        if (!p.kategId.HasValue) {
          p.kategId = 0;
        }

        SqlParameter pKategId = new SqlParameter("@kategId", p.kategId);
        pKategId.SqlDbType = SqlDbType.Int;

        if (!p.uluchId.HasValue) {
          p.uluchId = 0;
        }

        SqlParameter pUluchId = new SqlParameter("@uluchId", p.uluchId);
        pUluchId.SqlDbType = SqlDbType.Int;

        if (String.IsNullOrEmpty(p.dopFilter)) {
          p.dopFilter = "";
        }

        SqlParameter pDopFilter = new SqlParameter("@dopFilter", p.dopFilter);
        pDopFilter.SqlDbType = SqlDbType.VarChar;

        SqlParameter pDZv = new SqlParameter("@dZv", DBNullOrValue(p.dZv));
        pDZv.SqlDbType = SqlDbType.DateTime;

        SqlParameter pDZvOrderBy = new SqlParameter("@dZvOrderBy", p.dZvOrderBy);
        pDZvOrderBy.SqlDbType = SqlDbType.Int;

        return db.Database.SqlQuery<BazaListViewModel>
          (@"exec dbo.GET_BAZA_LIST @page = @page, @rows_per_page = @rows_per_page,
                                    @m_org_id = @m_org_id, @fio = @fio, @posHodit = @posHodit,
                                    @posDn = @posDn, @posNaDatu = @posNaDatu,
                                    @zabolId = @zabolId, @periodS = @periodS, @periodPo = @periodPo,
                                    @regS = @regS, @regPo = @regPo, @seansId = @seansId, @productIds = @productIds,
                                    @kategId = @kategId, @uluchId = @uluchId, @dopFilter = @dopFilter, @dZv = @dZv,
                                    @dZvOrderBy = @dZvOrderBy",
           pPage, pRows_per_page, pM_org_id, pFio, pPosHodit, pPosDn, pPosNaDatu, pZabolId, 
           pPeriodS, pPeriodPo, pRegS, pRegPo, pSeansId, pProductIds, pKategId, pUluchId, pDopFilter, pDZv, pDZvOrderBy)
        .ToList<BazaListViewModel>();
      }
    }

    // возвратить анкету в ответ на запрос по ID
    [HttpGet]
    public ContentResult GetAnkRequest(int ID) {

      O_ANKViewModel ank = GetAnk(ID: ID);

      if (ank == null) {
          HttpContext.Response.StatusCode = (int)System.Net.HttpStatusCode.BadRequest;
          return Content("{\"error\": \"Не удалось найти анкету с идентификатором = " + ID + "\"}", "application/json");
      } else {
        return Content(JsonConvert.SerializeObject(ank), "application/json");
      }


    }


    // получить анкету из базы
    public O_ANKViewModel GetAnk(int ID) {

      DateTime now = CreateDate();

      using (ATLANTEntities db = new ATLANTEntities()) {

        O_ANK ank;
        IEnumerable<O_ANK_ZABOLViewModel> zabol;
        O_ANKViewModel model;

        ank = db.O_ANK.Find(ID);

        if (ank == null) {

          return null;
          
        }

        model = Mapper.Map<O_ANKViewModel>(ank);

        // получаю ФИО посетителя для Источника информации
        try {
          O_ANK p = db.O_ANK.Find(model.FIO_INFO_ID);
          string sur, nam, sec;
          sur = p.SURNAME ?? "";
          nam = p.NAME ?? "";
          sec = p.SECNAME ?? "";
          model.FIO_INFO_ID_NAME = sur + " " + nam + " " + sec;
        } catch {
        }

        zabol = db.O_ANK_ZABOL.Where(x => x.O_ANK_ID == ank.ID)
          .Select(n => new O_ANK_ZABOLViewModel {
                      ID = n.ID, M_ZABOL_ID = n.M_ZABOL_ID.Value, O_ANK_ID = n.O_ANK_ID.Value,
                      M_ZABOL_NAME = db.M_ZABOL.Where(y => y.ID == n.M_ZABOL_ID).FirstOrDefault().NAME
          })
          .ToList();

        model.O_ANK_ZABOL = zabol;

        var u = db.S_USER.Find(model.USER_REG);
        if (u != null) {
          model.fio_reg = (u.SURNAME ?? "") + " " + (u.NAME ?? "") + " " + (u.SECNAME ?? "");
        }

        
        // проверяю, не зарегистрирован ли он уже сегодня, чтобы блокировать 
        // повторную регистрацию сегодня
        var reg = db.O_SEANS.Where(x => x.O_ANK_ID == model.ID &&
                                     DbFunctions.TruncateTime(x.D_REG) == now.Date).ToList();

        if (reg.Count > 0) {
          var reg1 = reg.First();
          if (reg1.M_SEANS_TIME_ID.HasValue && reg1.M_SEANS_TIME_ID > 0) {
            var seans = db.M_SEANS_TIME.Where(x => x.ID == reg1.M_SEANS_TIME_ID);
            if (seans.Count() > 0) {
              model.reg_status = "Уже зарегистрирован на сегодня " + seans.First().NAME;
            } else {
              model.reg_status = "Уже зарегистрирован на сегодня";
            }
          } else {
            model.reg_status = "Уже зарегистрирован на сегодня";
          }
        }

        var k = db.O_KONT_ANK.Where(a => a.O_ANK_ID == ank.ID).FirstOrDefault();
        if (k != null) {
          model.IST_INFO_USERID = (k.USERID ?? -1);
        } else {
          model.IST_INFO_USERID = -1;
        }

        return model;        

      };

    }


    // получить справочник заболеваний M_ZABOL
    public ContentResult GetM_ZABOL() {

       using (ATLANTEntities db = new ATLANTEntities()) {
       
         IEnumerable<M_ZABOL> mZabol;
         mZabol = db.M_ZABOL.ToList();

         return Content(JsonConvert.SerializeObject(mZabol), "application/json");

       }

    }


    // получить справочник Источник информации M_IST_INF
    public ContentResult GetM_IST_INF() {

       using (ATLANTEntities db = new ATLANTEntities()) {
       
         IEnumerable<M_IST_INF> mIstInf;
         mIstInf = db.M_IST_INF.ToList();

         return Content(JsonConvert.SerializeObject(mIstInf), "application/json");

       }

    }


    // получить справочник полов M_SEX
    public ContentResult GetM_SEX() {

       using (ATLANTEntities db = new ATLANTEntities()) {
       
         IEnumerable<M_SEX> mSex;
         mSex = db.M_SEX.ToList();

         return Content(JsonConvert.SerializeObject(mSex), "application/json");

       }

    }

    // получить справочник справочников M_MANUAL, для редактирования
    public ContentResult GetM_MANUAL() {

      using (ATLANTEntities db = new ATLANTEntities()) {

        IEnumerable<M_MANUAL> mManual;
        mManual = db.M_MANUAL.ToList();

        return Content(JsonConvert.SerializeObject(mManual), "application/json");

      }

    }


    // получить справочник пользователей S_USER
    public ContentResult GetS_USER() {

       using (ATLANTEntities db = new ATLANTEntities()) {
       
         var sUser = db.S_USER.Join(
           db.AspNetUsers,
           s_user => s_user.AspNetUsersId,
           asp => asp.Id,
           (s_user, asp) => new {
              ID = s_user.ID,
              S_USER_ROLE_ID = s_user.S_USER_ROLE_ID,
              SURNAME = s_user.SURNAME,
              NAME = s_user.NAME,
              SECNAME = s_user.SECNAME,
              M_ORG_ID = s_user.M_ORG_ID,
              AspNetUsersId = s_user.AspNetUsersId,
              PHOTO = s_user.PHOTO,
              UserName = asp.UserName,
              BIRTHDAY = s_user.BIRTHDAY,
              HIRE_DATE = s_user.HIRE_DATE,
              FIO = (s_user.SURNAME ?? "") + " " + (s_user.NAME ?? "")  + " " + (s_user.SECNAME ?? ""),
              s_user.SIP_LOGIN,
              s_user.SIP_PASSWORD,
              s_user.PHONE_MOBILE,
              DISMISS_DATE = s_user.DISMISS_DATE
           }
         );

         return Content(JsonConvert.SerializeObject(sUser), "application/json");

       }

    }

    // получить справочник мест сеанса
    public ContentResult GetM_SEANS_PLACE() {
      using (ATLANTEntities db = new ATLANTEntities()) {
        UserContext uc = GetUserContext();
        List<SeansPlaceData> sPlace = new List<SeansPlaceData>();
        int i = 1;
        foreach (var a in db.M_SEANS_PLACE.Where(a => a.M_ORG_ID == uc.M_ORG_ID)) {
          SeansPlaceData s = new SeansPlaceData();
          s.ID = a.ID;
          s.NAME = a.NAME;
          s.M_PRODUCT_ID = a.M_PRODUCT_ID;
          s.M_RYAD_ID = a.M_RYAD_ID;
          s.M_ORG_ID = a.M_ORG_ID;
          s.NUM = i.ToString() + " - " + a.NAME;
          sPlace.Add(s);
          i++;
        }

        return Content(JsonConvert.SerializeObject(sPlace), "application/json");
      }
    }

    public JsonResult GetSeansData(string date, int m_seans_time_id) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        DateTime dt = CreateDate();
        if (date != "") {
          dt = Convert.ToDateTime(date);
        }

        UserContext uc = GetUserContext();

        SqlParameter pDate = new SqlParameter("@date", dt);
        pDate.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter pSeansTimeId = new SqlParameter("@seans_time_id", m_seans_time_id);
        pSeansTimeId.SqlDbType = SqlDbType.Int;

        SqlParameter pMOrgId = new SqlParameter("@m_org_id", uc.M_ORG_ID);
        pMOrgId.SqlDbType = SqlDbType.Int;

        var d = db.Database.SqlQuery<SeansData>("EXEC [dbo].[GET_RYAD_DATA] @date = @date, @seans_time_id = @seans_time_id, @m_org_id = @m_org_id",
        pDate, pSeansTimeId, pMOrgId).ToList();
        return Json(d, JsonRequestBehavior.AllowGet);
      }
    }

    [HttpPost]
    public JsonResult SeansSave(O_SEANS s, string comment) {

      string message = "", time = "";
      int ID = s.ID;
      DateTime now = CreateDate();

      // избавляюсь от разницы +4 часа
      if (s.SEANS_DATE.HasValue) {
        s.SEANS_DATE = s.SEANS_DATE.Value.ToUniversalTime().Date;
      }
      //
      if (s.D_REG.HasValue) {
        s.D_REG = s.D_REG.Value.ToUniversalTime();
      }
      //
      if (s.D_START.HasValue) {
        s.D_START = s.D_START.Value.ToUniversalTime();
      }
      

      using (ATLANTEntities db = new ATLANTEntities()) {
        UserContext uc = GetUserContext();
        var d = db.O_SEANS.Where(x => x.O_ANK_ID == s.O_ANK_ID &&
                                      DbFunctions.TruncateTime(x.SEANS_DATE) == DbFunctions.TruncateTime(s.SEANS_DATE) &&
                                      x.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();
        // уже записан
        if (d == null) {
          s.ID = 0;
          s.LANE = 1; // запись из рядов
          s.USERID = uc.ID;
          s.M_ORG_ID = uc.M_ORG_ID;
          s.D_START = now;
          s.D_MODIF = now;
          db.O_SEANS.Add(s);

          // переданный комментарий сохраняем в общение
          if (comment != "") {
            // только из рядов заполняем
            var seans = db.O_SEANS.Find(ID);
            if (seans != null) {
              var visits = db.O_SEANS.Where(a => a.O_ANK_ID == s.O_ANK_ID &&
                                   DbFunctions.TruncateTime(a.D_REG) <= now.Date &&
                                   a.SEANS_STATE == SEANS_STATE_SOSTOYALSYA &&
                                   a.M_ORG_ID == uc.M_ORG_ID).ToList();
              var count = visits.Count;
              O_DIALOG o = new O_DIALOG();
              o.O_ANK_ID = s.O_ANK_ID;
              o.COMMENT = comment;
              o.USERID = uc.ID;
              o.DIALOG_DATE = now;
              o.O_SEANS_ID = ID;
              o.NPOS = count.ToString() + " " + getDateddMMyyyyStr(now) + " " + getTimehhMMStr(now) + " " + (uc.SURNAME ?? "") + " " + (uc.NAME ?? "");
              db.O_DIALOG.Add(o);
            }
          }
          db.SaveChanges();
          message = "true";
        } else {
          message = "exists";
          var e = db.M_SEANS_TIME.Where(f => f.ID == s.M_SEANS_TIME_ID).FirstOrDefault();
          time = e.MIN_TIME ?? "";
        }
      }
      return Json(new { success = message, time = time});
    }

    [HttpPost]
    public JsonResult SeansCommentSave(List<O_SEANS_COMMENT> s) {

      // избавляюсь от разницы +4 часа
      foreach(var item in s) {
        if (item.SEANS_DATE.HasValue) {
          item.SEANS_DATE = item.SEANS_DATE.Value.ToUniversalTime().Date;
        }
      }

      using (ATLANTEntities db = new ATLANTEntities()) {
        UserContext uc = GetUserContext();
        foreach (var d in s) {
          if (d.ID == 0) {
            d.USERID = uc.ID;
            db.O_SEANS_COMMENT.Add(d);
          } else {
            if (d.COMMENT == null) {
              O_SEANS_COMMENT c = db.O_SEANS_COMMENT.Find(d.ID);
              db.O_SEANS_COMMENT.Remove(c);
            } else {
              O_SEANS_COMMENT c = db.O_SEANS_COMMENT.Find(d.ID);
              db.Entry(c).CurrentValues.SetValues(d);
            }
          }
        }
        db.SaveChanges();
      }
      return Json(new { success = "true" });
    }

    // Получение комментария на дату сеанса
    public JsonResult GetSeansComment(string date) {

      DateTime now = CreateDate();
      DateTime dt = now;
      if (date != "") {
        try {
          dt = Convert.ToDateTime(date);
        } catch {
          dt = now;
        }
      }
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from item in db.O_SEANS_COMMENT.Where(a => DbFunctions.TruncateTime(a.SEANS_DATE) == dt.Date)
                select
                    new
                    {
                      item.ID,
                      item.COMMENT,
                      SEANS_DATE = item.SEANS_DATE.Value.Year.ToString() + "-" +
                                   item.SEANS_DATE.Value.Month.ToString() + "-" +
                                   item.SEANS_DATE.Value.Day.ToString()
                    };
        return Json(d.ToList(), JsonRequestBehavior.AllowGet);
      }
    }

    [HttpPost]
    public JsonResult NewAnkAndSignUpSeans(O_RECORD r) {

      // избавляюсь от разницы +4 часа
      if (r.O_ANK.BIRTHDAY.HasValue) {
        r.O_ANK.BIRTHDAY = r.O_ANK.BIRTHDAY.Value.ToUniversalTime();
      }
      //
      if (r.O_ANK.DATE_REG.HasValue) {
        r.O_ANK.DATE_REG = r.O_ANK.DATE_REG.Value.ToUniversalTime();
      }
      // 
      if (r.O_SEANS.SEANS_DATE.HasValue) {
        r.O_SEANS.SEANS_DATE = r.O_SEANS.SEANS_DATE.Value.ToUniversalTime().Date;
      }
      // 
      if (r.O_SEANS.D_REG.HasValue) {
        r.O_SEANS.D_REG = r.O_SEANS.D_REG.Value.ToUniversalTime();
      }
      // 
      if (r.O_SEANS.D_START.HasValue) {
        r.O_SEANS.D_START = r.O_SEANS.D_START.Value.ToUniversalTime();
      }
      

      r.O_ANK.SURNAME = Capitalize(r.O_ANK.SURNAME);
      r.O_ANK.NAME = Capitalize(r.O_ANK.NAME);
      r.O_ANK.SECNAME = Capitalize(r.O_ANK.SECNAME);

      string message = "", time = "";
      int exists = 0;
      UserContext uc = GetUserContext();

      DateTime now = CreateDate();

      r.O_ANK.M_ORG_ID = uc.M_ORG_ID;

      using (ATLANTEntities db = new ATLANTEntities()) {

        string surname = r.O_ANK.SURNAME ?? "";
        string name = r.O_ANK.NAME ?? "";
        string secname = r.O_ANK.SECNAME ?? "";



        // поиск только по телефону, если не найден по телефону, тогда новая запись
        // для новой записи ФИО должно быть полностью заполнено (не уверен, что это правильно)
        // если ФИО заполнено полностью

        // сначала ищем по телефону
        var a = db.O_ANK.Where(t => t.PHONE_MOBILE.ToUpper() == r.O_ANK.PHONE_MOBILE.ToUpper() && t.M_ORG_ID == uc.M_ORG_ID).ToList();

        // не нашли - создаём новую анкету
        if (a.Count() == 0) { 

          // ФИО должно быть заполнено полностью
          if ((surname == "") || (name == "") || (secname == "")) {

            exists = -1; // Недостаточно данных
            message = "fio";

          // ФИО заполнено, создаём новую анкету
          } else {

            if ((surname != "") && (name != "") && (secname != "")) { // ФИО полностью
              r.O_ANK.DATE_REG = now;
              r.O_ANK.USER_REG = uc.ID; // пользователь
              r.O_ANK.M_ORG_ID = uc.M_ORG_ID;

              var id = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_ANK_ID as int)").First();
              r.O_ANK.ID = id;

              db.O_ANK.Add(r.O_ANK);
              db.SaveChanges();

              // скрываю соответствующий Контакт, если есть
              HideKont(r.O_ANK);

              r.O_SEANS.O_ANK_ID = r.O_ANK.ID;
            }

          }

        // нашли слишком много, дубли телефона
        } else if (a.Count() > 1) { 

            exists = -1;
            message = "dubli";
            foreach(var d in a) {
              time = time + (d.ID.ToString() ?? "") + ",";
            }
            time = time.Substring(0,time.Length - 1);

        // нашли ровно одну анкету
        } else {

          var b = a.First();

          // проверяю, не записан ли он уже на сегодня
          r.O_SEANS.O_ANK_ID = b.ID;
          var d = db.O_SEANS.Where(x => x.O_ANK_ID == b.ID &&
                                    DbFunctions.TruncateTime(x.SEANS_DATE) == DbFunctions.TruncateTime(r.O_SEANS.SEANS_DATE) &&
                                    x.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();

          // уже записан
          if (d != null) {
            exists = 1;
            var e = db.M_SEANS_TIME.Where(f => f.ID == d.M_SEANS_TIME_ID).FirstOrDefault();
            time = e.MIN_TIME ?? "";
            message = "exists";
          }

        }

        // если не записан
        if (exists == 0) {
          // если записываем из режима "Ряды"
          if (r.O_SEANS.M_RYAD_ID != null) {

            // если дата записи больше сегодняшней, это запись
            // иначе сажают человека без записи
            var timespan = (r.O_SEANS.SEANS_DATE.Value - now).TotalDays;

            if (timespan > 0) {
              r.O_SEANS.LANE = 1; // запись из рядов
              r.O_SEANS.BEZ_REG = 0;
              r.O_SEANS.SEANS_STATE = SEANS_STATE_ZAPISALSYA; // записываем
            } else {
              r.O_SEANS.LANE = 1; // запись из рядов
              r.O_SEANS.BEZ_REG = 1; // без регистрации
              r.O_SEANS.USERID_REG = uc.ID;
              r.O_SEANS.D_REG = r.O_SEANS.SEANS_DATE;
              r.O_SEANS.SEANS_DATE = null;  // записи не было
              r.O_SEANS.SEANS_STATE = SEANS_STATE_SOSTOYALSYA; // фактически сеанс состоялся

              int? place_id = db.M_SEANS_PLACE.Where(p => p.M_ORG_ID == uc.M_ORG_ID).Min(b => b.ID); // сажаем на первое место
              r.O_SEANS.M_SEANS_PLACE_ID = place_id;
            }
          } else {
            r.O_SEANS.LANE = 0; // если записываем из режима "Запись"
          }

          r.O_SEANS.D_START = now;
          r.O_SEANS.USERID = uc.ID;
          r.O_SEANS.M_ORG_ID = uc.M_ORG_ID;
          r.O_SEANS.D_MODIF = now;
          db.O_SEANS.Add(r.O_SEANS);
          db.SaveChanges();
          message = "true";
        }
      }
      return Json(new { success = message, time = time });
    }


    // получить фото из анкеты
    // id - O_ANK.ID
    [HttpGet]
    public ActionResult GetAnkPhoto(int id) {

      using (ATLANTEntities db = new ATLANTEntities()) {

        O_ANK a;
        a = db.O_ANK.Find(id);

        if (a == null) {
          return HttpNotFound();
        }

        if (a.PHOTO != null) {
          return File(a.PHOTO, "image/jpg");
        } else {
          return File(System.IO.File.ReadAllBytes(Server.MapPath("~") + EMPTY_PHOTO), "image/png");
        }

      }

    }


    // для автопоиска по фамилии Поситителя для Источника информации
    [HttpGet]
    public ActionResult GetO_ANK_FIO_INFO_ID(String term) {

      IEnumerable<IdValueViewModel> fio;

      if (String.IsNullOrEmpty(term)) {
        return Json(new {empty = true}, JsonRequestBehavior.AllowGet);
      }

      using (ATLANTEntities db = new ATLANTEntities()) {

        fio = db.O_ANK.Where(n => ((n.SURNAME ?? "") + " " + (n.NAME ?? "") + " " + (n.SECNAME ?? "")).Contains(term))
          .Select(n => new IdValueViewModel
            {
              value = (n.SURNAME ?? "") + " " + (n.NAME ?? "") + " " + (n.SECNAME ?? ""),
              id = n.ID
            }
          ).ToList();

      }

      return Json(fio, JsonRequestBehavior.AllowGet);

    }


    // сохраняем звонки
    [HttpPost]
    public JsonResult SaveZvonokData(O_ZVONOK_DATA z) {

      string message = "", time = "";
      DateTime now = CreateDate();

      using (ATLANTEntities db = new ATLANTEntities()) {
        UserContext uc = GetUserContext();
        if (z.O_ZVONOK != null) {
          foreach(var o in z.O_ZVONOK) {
            // избавляюсь от разницы +4 часа
            if (o.D_END_ISKL.HasValue) {
              o.D_END_ISKL = o.D_END_ISKL.Value.ToUniversalTime();
			        o.D_END_ISKL_USER_ID = uc.ID;
            }
            //
            if (o.D_MODIF.HasValue) {
              o.D_MODIF = o.D_MODIF.Value.ToUniversalTime();
			        o.D_MODIF_USER_ID = uc.ID;
			      }
            //
            if (o.D_START.HasValue) {
              o.D_START = o.D_START.Value.ToUniversalTime();
			        o.D_START_USER_ID = uc.ID;
			      }

            // пользователь
            var visits = db.O_SEANS.Where(a => a.O_ANK_ID == o.O_ANK_ID &&
                                          DbFunctions.TruncateTime(a.D_REG) <= now.Date &&
                                          a.SEANS_STATE == SEANS_STATE_SOSTOYALSYA &&
                                          a.M_ORG_ID == uc.M_ORG_ID).ToList();
            var count = visits.Count;
            o.OPERATOR = count.ToString() + " " + getDateddMMyyyyStr(now) + " " + getTimehhMMStr(now) + " " + (uc.SURNAME ?? "") + " " + (uc.NAME ?? "");

            o.D_START = now;
            o.D_MODIF = now;
            o.M_ORG_ID = uc.M_ORG_ID;
            o.USERID = uc.ID;
			      db.O_ZVONOK.Add(o);

            // сохраняем действие
            O_DEISTV d = new O_DEISTV();
            var e = db.O_ANK.Find(o.O_ANK_ID);
            if (e != null) {

              d.MESS = uc.UserName + " Добавил(а) в анкете " + (e.SURNAME ?? "") + " " + (e.NAME ?? "") + " " + (e.SECNAME ?? "") +
                                     " в звонках комментарий '" + o.COMMENT + "'";
              d.O_ANK_ID = o.O_ANK_ID;
              d.M_DEISTV_ID = 3; // Звонки
              d.D_START = CreateDate();
              d.M_ORG_ID = uc.M_ORG_ID;
              d.USERID = uc.ID;
              db.O_DEISTV.Add(d);
            }
          }
          
          db.SaveChanges();
          message = "true";
        }

        if (z.O_SEANS != null) {
          
          foreach(var s in z.O_SEANS) {
            if (s.ID == 0) {  // сохранение новой записи
              // избавляюсь от разницы +4 часа
              if (s.SEANS_DATE.HasValue) {
                s.SEANS_DATE = s.SEANS_DATE.Value.ToUniversalTime().Date;
              }
              //
              if (s.D_REG.HasValue) {
                s.D_REG = s.D_REG.Value.ToUniversalTime();
              }
              //
              if (s.D_START.HasValue) {
                s.D_START = s.D_START.Value.ToUniversalTime();
              }

              var h = db.O_SEANS.Where(x => x.O_ANK_ID == s.O_ANK_ID && 
                                       DbFunctions.TruncateTime(x.SEANS_DATE) == DbFunctions.TruncateTime(s.SEANS_DATE) &&
                                       x.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();
              // ещё не записан
              if (h == null) {
                s.M_ORG_ID = GetUserContext().M_ORG_ID;
                s.USERID = GetUserContext().ID;
                s.LANE = 0;
                s.D_START = now;
                db.O_SEANS.Add(s);
              
                // сохраняем действие
                O_DEISTV o = new O_DEISTV();
                var e = db.O_ANK.Find(s.O_ANK_ID);
                if (e != null) {

                  o.MESS = uc.UserName + " Записал(а) " + (e.SURNAME ?? "") + " " + (e.NAME ?? "") + " " + (e.SECNAME ?? "") +
                                         " из звонков на сеанс " + getDateddMMyyyyStr(s.SEANS_DATE);
                  o.O_ANK_ID = s.O_ANK_ID;
                  o.M_DEISTV_ID = M_DEISTV_ZVONKI;
                  o.D_START = CreateDate();
                  o.M_ORG_ID = uc.M_ORG_ID;
                  o.USERID = uc.ID;
                  db.O_DEISTV.Add(o);
                }

                message = "true";
              // уже записан
              } else {
                var e = db.M_SEANS_TIME.Where(f => f.ID == h.M_SEANS_TIME_ID).FirstOrDefault();
                time = e.MIN_TIME ?? "";
                message = "exists";
              }
            } else {
              var a = db.O_SEANS.Find(s.ID);
              if (s.M_SEANS_TIME_ID == a.M_SEANS_TIME_ID) { // время то же
                if (DbFunctions.TruncateTime(a.SEANS_DATE) == DbFunctions.TruncateTime(s.SEANS_DATE)) { // запись, в которой меняется дата записи, имеет ту же дату
                  message = "exists";
                  var e = db.M_SEANS_TIME.Where(f => f.ID == s.M_SEANS_TIME_ID).FirstOrDefault();
                  time = e.MAX_TIME ?? "";
                } else {
                  // пытаемся перенести запись, на день, в котором у человека уже есть запись
                  var g = db.O_SEANS.Where(x => x.O_ANK_ID == s.O_ANK_ID &&
                                                DbFunctions.TruncateTime(x.SEANS_DATE) == DbFunctions.TruncateTime(s.SEANS_DATE) &&
                                                x.M_ORG_ID == uc.M_ORG_ID &&
                                                x.ID != a.ID).FirstOrDefault();
                  // уже записан
                  if (g == null) {
                    var b = a;
                    b.M_ORG_ID = uc.M_ORG_ID;
                    b.USERID = uc.ID;
                    b.LANE = 0;

                    // сохраняем действие
                    O_DEISTV o = new O_DEISTV();
                    var e = db.O_ANK.Find(b.O_ANK_ID);
                    if (e != null) {

                      o.MESS = uc.UserName + " Перенес(ла) в анкете " + (e.SURNAME ?? "") + " " + (e.NAME ?? "") + " " + (e.SECNAME ?? "") +
                                             " из звонков сеанс c " + getDateddMMyyyyStr(b.SEANS_DATE) + " на " + getDateddMMyyyyStr(s.SEANS_DATE);
                      o.O_ANK_ID = b.O_ANK_ID;
                      o.M_DEISTV_ID = M_DEISTV_ZVONKI;
                      o.D_START = CreateDate();
                      o.M_ORG_ID = uc.M_ORG_ID;
                      o.USERID = uc.ID;
                      db.O_DEISTV.Add(o);
                    }

                    b.SEANS_DATE = s.SEANS_DATE;
                    b.M_SEANS_TIME_ID = s.M_SEANS_TIME_ID;
                    db.Entry(a).CurrentValues.SetValues(b);
                    db.SaveChanges();
                    message = "true";
                  } else {
                    message = "exists";
                    var e = db.M_SEANS_TIME.Where(f => f.ID == g.M_SEANS_TIME_ID).FirstOrDefault();
                    time = e.MAX_TIME ?? "";
                  }
                }
              } else { 
                // время для переноса другое, проверяем существование записи
                // пытаемся перенести запись, на день, в котором у человека уже есть запись
                var m = db.O_SEANS.Where(x => x.O_ANK_ID == s.O_ANK_ID &&
                                              DbFunctions.TruncateTime(x.SEANS_DATE) == DbFunctions.TruncateTime(s.SEANS_DATE) &&
                                              x.M_ORG_ID == uc.M_ORG_ID &&
                                              x.ID != a.ID).FirstOrDefault();
                // уже записан
                if (m == null) {
                  var b = a;
                  b.M_ORG_ID = uc.M_ORG_ID;
                  b.USERID = uc.ID;
                  b.LANE = 0;

                  // сохраняем действие
                  O_DEISTV o = new O_DEISTV();
                  var e = db.O_ANK.Find(b.O_ANK_ID);
                  if (e != null) {

                    o.MESS = uc.UserName + " Перенес(ла) в анкете " + (e.SURNAME ?? "") + " " + (e.NAME ?? "") + " " + (e.SECNAME ?? "") +
                                           " из звонков сеанс c " + getDateddMMyyyyStr(b.SEANS_DATE) + " на " + getDateddMMyyyyStr(s.SEANS_DATE);
                    o.O_ANK_ID = b.O_ANK_ID;
                    o.M_DEISTV_ID = M_DEISTV_ZVONKI;
                    o.D_START = CreateDate();
                    o.M_ORG_ID = uc.M_ORG_ID;
                    o.USERID = uc.ID;
                    db.O_DEISTV.Add(o);
                  }

                  b.SEANS_DATE = s.SEANS_DATE;
                  b.M_SEANS_TIME_ID = s.M_SEANS_TIME_ID;
                  db.Entry(a).CurrentValues.SetValues(b);
                  db.SaveChanges();
                  message = "true";
                } else {
                  message = "exists";
                  var e = db.M_SEANS_TIME.Where(f => f.ID == m.M_SEANS_TIME_ID).FirstOrDefault();
                  time = e.MAX_TIME ?? "";
                }
              }
            }
          } // end foreach

          db.SaveChanges();
        } //end if (z.O_SEANS
      }
      return Json(new { success = message, time = time });
    }

    // получаем запись на анкету, дату, сеанс
    [HttpGet]
    public JsonResult GetSeansInfo(string date, int o_ank_id, int m_seans_time_id) {

      DateTime now = CreateDate();

      DateTime dt = now;
      if (date != "") {
        try {
          dt = Convert.ToDateTime(date);
        } catch {
          dt = now;
        }
      }
      using (ATLANTEntities db = new ATLANTEntities()) {
        UserContext uc = GetUserContext();
        var d = from item in db.O_SEANS.Where(a => a.SEANS_DATE.Value.Year == dt.Year &&
                                                   a.SEANS_DATE.Value.Month == dt.Month &&
                                                   a.SEANS_DATE.Value.Day == dt.Day &&
                                                   a.O_ANK_ID == o_ank_id &&
                                                   a.M_SEANS_TIME_ID == m_seans_time_id &&
                                                   a.M_ORG_ID == uc.M_ORG_ID)
                select
                    new {
                      item.ID
                    };
        return Json(d.ToList(), JsonRequestBehavior.AllowGet);
      }
    }

    [HttpGet]
    public string GetProductPhoto(int id) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        O_SERVICE s;
        s = db.O_SERVICE.Find(id);
        if (s == null) {
          return "";
        }
        return "data:image/JPEG;base64," + Convert.ToBase64String(s.PRODUCT_PHOTO);
      }
    }

    [HttpGet]
    public string GetProductGuarantee(int id) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        O_SERVICE s;
        s = db.O_SERVICE.Find(id);
        if (s == null) {
          return "";
        }
        return "data:image/JPEG;base64," + Convert.ToBase64String(s.GUARANTEE_PHOTO);
      }
    }

    [HttpGet]
    public string GetProductCheck(int id) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        O_SERVICE s;
        s = db.O_SERVICE.Find(id);
        if (s == null)
        {
          return "";
        }
        return "data:image/JPEG;base64," + Convert.ToBase64String(s.PRODUCT_CHECK);
      }
    }

    // данные о сервисе
    [HttpGet]
    public ActionResult GetServiceData(int id) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        var s = db.O_SERVICE.Where(o => o.O_ANK_ID == id).FirstOrDefault();
        if (s == null) {
          return Json(null, JsonRequestBehavior.AllowGet);
        } else {
          var r = from item in db.O_SERVICE.Where(o => o.O_ANK_ID == id &&
                                                       // #377 обработанные техотделом записи не берем
                                                       o.M_SERVICE_TYPE_ID_TEH_OTDEL != M_SERVICE_TYPE_ID_SDELAL)
                  select
                      new { 
                        item.ID,
                        item.M_SERVICE_TYPE_ID,
                        item.M_PRODUCT_ID,
                        item.SERIAL_NUMBER,
                        item.COMMENT
                      };
          return Json(r.ToList(), JsonRequestBehavior.AllowGet);
        }
      }
    }

    // сохраняем данные сервиса
    [HttpPost]
    public JsonResult SaveService(O_SERVICE s, string productPhoto, string guaranteePhoto, string checkPhoto) {

      // избавляюсь от разницы +4 часа
      s.D_START = DateTimeToUniversalTime(s.D_START);

      DateTime now = CreateDate();

      using (ATLANTEntities db = new ATLANTEntities()) {
        // фото товара
        UserContext uc = GetUserContext();
        if (!String.IsNullOrEmpty(productPhoto)) {
          s.PRODUCT_PHOTO = Convert.FromBase64String(productPhoto);
        }
        // фото гарантийного документа
        if (!String.IsNullOrEmpty(guaranteePhoto)) {
          s.GUARANTEE_PHOTO = Convert.FromBase64String(guaranteePhoto);
        }
        // фото товарного чека
        if (!String.IsNullOrEmpty(checkPhoto)) {
          s.PRODUCT_CHECK = Convert.FromBase64String(checkPhoto);
        }

        if (s.ID == 0) {
          s.D_START = now;
          s.USERID = uc.ID;
          s.M_ORG_ID = uc.M_ORG_ID;
          db.O_SERVICE.Add(s);
        } else {
          var o = db.O_SERVICE.Find(s.ID);
          s.D_MODIF = now;
          s.USERID = uc.ID;
          s.M_ORG_ID = uc.M_ORG_ID;
          db.Entry(o).CurrentValues.SetValues(s);
        }
        db.SaveChanges();
      }
      return Json(new { success = "true" });
    }

    // статистика, сеансы
    public JsonResult GetStatSeansInfo (int id, int? reg, int? lane, int? last) {
      List<StatSeansInfo> s = new List<StatSeansInfo>();
      List<int> Users, Lane;
      double v = 0.00, c = 0.00, p = 0.00;

      if (id == 0) {
        return Json(s, JsonRequestBehavior.AllowGet);
      }

      DateTime now = CreateDate();

      using (ATLANTEntities db = new ATLANTEntities()) {
        // всего визитов
        var f = db.O_SEANS.Where(b => b.O_ANK_ID == id && b.SEANS_STATE == SEANS_STATE_SOSTOYALSYA && DbFunctions.TruncateTime(b.D_REG) <= now.Date).ToList();
        
        // отбираем пользователей
        Users = new List<int> {};
        Lane = new List<int> {};
        // регистрация
        foreach (var n in f.Where(h => h.USERID_REG != null)) {
          Users.Add(n.USERID_REG.Value);
        }
        // ряды
        foreach (var n in f.Where(h => h.USERID != null)) {
          Lane.Add(n.USERID.Value);
        }

        IEnumerable<int> distUserId = Users.Distinct();
        IEnumerable<int> distLaneId = Lane.Distinct();

        if (f.Count > 0) {
          if (reg == null && lane == null && last == null) { // время
            foreach (var t in db.M_SEANS_TIME) {
              // по времени
              var d = f.Where(e => e.M_SEANS_TIME_ID == t.ID).ToList();
              StatSeansInfo ssi = new StatSeansInfo();
              ssi.time = t.MIN_TIME;  // сеанс
              if (d.Count != 0) {
                ssi.visits = d.Count.ToString();  // количество
                v = Convert.ToDouble(d.Count);
                c = Convert.ToDouble(f.Count);
                p = (v / c) * 100;
                ssi.part = Convert.ToInt16(p).ToString() + "%"; // доля
                s.Add(ssi);
              }
            }
          } else if (reg != null) { // регистрация
            foreach (var u in distUserId) {
              var d = f.Where(e => e.USERID_REG == u).ToList();
              if (d.Count != 0) {
                StatSeansInfo ssi = new StatSeansInfo();
                var m = db.S_USER.Where(g => g.ID == u).FirstOrDefault();
                if (m != null) {
                  ssi.time = (m.SURNAME + " " ?? "") + (m.NAME + " " ?? "") + (m.SECNAME ?? "");  // ФИО
                }
                ssi.visits = d.Count.ToString();  // количество
                v = Convert.ToDouble(d.Count);
                c = Convert.ToDouble(f.Count);
                p = (v / c) * 100;
                ssi.part = Convert.ToInt16(p).ToString() + "%"; // доля
                s.Add(ssi);
              }
            }
          } else if (lane != null) {  // ряды
            foreach (var u in distLaneId) {
              var d = f.Where(e => e.USERID == u).ToList();
              if (d.Count != 0) {
                StatSeansInfo ssi = new StatSeansInfo();
                var m = db.S_USER.Where(g => g.ID == u).FirstOrDefault();
                if (m != null) {
                  ssi.time = (m.SURNAME + " " ?? "") + (m.NAME + " " ?? "") + (m.SECNAME ?? "");  // ФИО
                }
                ssi.visits = d.Count.ToString();  // количество
                v = Convert.ToDouble(d.Count);
                c = Convert.ToDouble(f.Count);
                p = (v / c) * 100;
                ssi.part = Convert.ToInt16(p).ToString() + "%"; // доля
                s.Add(ssi);
              }
            }
          } else if (last != null) {
            // TODO: здесь ошибка, если с LANE == 1 не записей, то Max() выдаст ошибку
            // делаю проверку на это
            var a = f.ToList();
            if (a.Count > 0) {
              var d = f.Max(g => g.ID);
              var e = f.Where(h => h.ID == d).FirstOrDefault();
              StatSeansInfo ssi = new StatSeansInfo();
              if (e != null) {
                var u = db.S_USER.Where(t => t.ID == e.USERID).FirstOrDefault();
                if (u != null) {
                  ssi.time = (u.SURNAME + " " ?? "") + (u.NAME[0].ToString() + "." ?? "") + (u.SECNAME[0].ToString() + "." ?? "");
                  ssi.time = ssi.time + "#" + getDateddMMyyyyStr(e.D_REG);
                  ssi.visits = getDateddMMyyyyStr(e.D_REG) + "#" + (e.M_SEANS_PLACE_ID.ToString() ?? "");
                  var j = db.M_SEANS_TIME.Where(o => o.ID == e.M_SEANS_TIME_ID).FirstOrDefault();
                  if (j == null) {
                    ssi.part = "";
                  } else {
                    ssi.part = j.MAX_TIME;
                  }
                }
                s.Add(ssi);
              }
            }
          }
        }
      }
      return Json(s, JsonRequestBehavior.AllowGet);
    }



    // получить данные для отображения после сканирования
    // штрихкода в Регистрации
    // ID_CODE = O_ANK.ID_CODE (штрих-код)
    [HttpGet]
    public ActionResult GetRegData(int ID_CODE, int M_SEANS_TIME_ID) {

      O_ANK ank;

      UserContext uc = GetUserContext();

      DateTime now = CreateDate();

      using (ATLANTEntities db = new ATLANTEntities()) {

        // признак успешности действий
        bool success = true;
        // код ошибки, если будет
        int errCode = 0;
        // текст ошибки
        string err = "";

        // признак регистрации как гостя
        int IS_GOST = 0;

        // ищу только внутри своей организации, потому что они могут руками ввести ID анкеты
        // из чужого салона и записать человека на сеанс
        ank = db.O_ANK.Where(x => x.ID_CODE == ID_CODE && x.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();

        // если не нашёл в своём салоне, то можно попробовать поискать этого человека в другом
        // салоне и если у него есть действующий абонемент, то он должен загеристрироваться, как гость
        if (ank == null) {
          O_ANK ank1 = db.O_ANK.Where(x => x.ID_CODE == ID_CODE).FirstOrDefault();
          if (ank1 != null) {

            // есть ли действующий абонемент
            bool hasDeystvAbon = execHAS_DEYSTV_ABON(o_ank_id: ank1.ID);

            // есть действующий абонемент - пускаем, как гостя
            if (hasDeystvAbon) {
              ank = ank1;
              IS_GOST = 1;
            }

          }
        }

        if (ank == null) {
          return Content(JsonConvert.SerializeObject(new {success = false, err = "Анкета не найдена"}), "application/json");
        }

        M_SEANS_TIME currMSeansTime;
        currMSeansTime = db.M_SEANS_TIME.Find(M_SEANS_TIME_ID);
        if (currMSeansTime == null) {
          return Content(JsonConvert.SerializeObject(new {success = false, err = "Время сеанса не найдено"}), "application/json");
        }


        // проверяю, что человек на сегодня ещё не записан
        O_SEANS todaySeans =
          db.O_SEANS
            .Where(x => x.O_ANK_ID == ank.ID && DbFunctions.TruncateTime(x.D_REG) == now.Date)
            .FirstOrDefault()
        ;
        if (todaySeans != null)
        {
          currMSeansTime = db.M_SEANS_TIME.Find(todaySeans.M_SEANS_TIME_ID);
          success = false;
          errCode = 2;
          err = "Регистрация данной анкеты на сегодня уже осуществлялась, повторная регистрация невозможна";
        }



        int currMSeansTimeId = currMSeansTime.ID;

        // получаю порядковый номер текущего сеанса
        int? rn = db.Database.SqlQuery<int>("exec dbo.GET_M_SEANS_ROW_NUMBER @m_seans_time_id = @m_seans_time_id, @m_org_id = @m_org_id ;",
          new object[] {new SqlParameter("@m_seans_time_id", currMSeansTimeId), new SqlParameter("@m_org_id", uc.M_ORG_ID)}).FirstOrDefault();



        // предыдущие сеансы
        var seansList = db.O_SEANS.Where(x => x.O_ANK_ID == ank.ID && x.M_SEANS_PLACE_ID != null)
          .OrderByDescending(x => x.SEANS_DATE)
          .Join(db.M_SEANS_TIME, x => x.M_SEANS_TIME_ID, y => y.ID,
                  (x, y) => new {o_seans = x, m_seans_time = y})
          .Join(db.M_SEANS_PLACE, x => x.o_seans.M_SEANS_PLACE_ID, y => y.ID,
                  (x, y) => new TimeOborViewModel{time = x.m_seans_time.NAME, place = y.NAME})
        ;



        RegViewModel model = new RegViewModel {
          // блок ошибок, их может не быть, обрабатывается на стороне браузера
           success = success
          ,errCode = errCode
          ,err = err

          ,surname = ank.SURNAME
          ,name = ank.NAME
          ,secname = ank.SECNAME
          ,IS_GOST = IS_GOST
          ,O_ANK_ID = ank.ID
          ,M_SEANS_TIME_ID = currMSeansTime.ID

          // TODO: брать из таблицы все эти поля
          ,seans_current_info = "Время " + rn.ToString() + " (" + currMSeansTime.MIN_TIME + ")"
          ,min_time_minutes = currMSeansTime.MIN_TIME_MINUTES.Value
          ,zapolnennost = 40
          ,spetsialist = uc.fio
          ,seansCount = seansList.Count()
          ,seansList = seansList.Take(5)
          ,tovarList = new NameViewModel[] {
           }
        };


        return Content(JsonConvert.SerializeObject(model), "application/json");

      }

    }


    //  получить последний действующий или просто последний абонемент, даже если он не действует, либо null, если абонементов нет вообще
    private O_SKLAD_RAS_PRODUCT execGET_LAST_ABON(int o_ank_id, int m_org_id, ATLANTEntities db) {
    
      SqlParameter pO_ank_id = new SqlParameter("o_ank_id", SqlDbType.Int);
      pO_ank_id.Value = o_ank_id;

      SqlParameter pM_org_id = new SqlParameter("m_org_id", SqlDbType.Int);
      pM_org_id.Value = m_org_id;

      O_SKLAD_RAS_PRODUCT lastAbon =
        db.Database
          .SqlQuery<O_SKLAD_RAS_PRODUCT>(
            "exec dbo.[GET_ABON_LAST @o_ank_id = @o_ank_id, @m_org_id = @m_org_id",
            pO_ank_id,
            pM_org_id)
          .ToList()
          .FirstOrDefault();

       return lastAbon;

    }


    // есть ли действующий абонемент
    private bool execHAS_DEYSTV_ABON(int o_ank_id) {

      UserContext uc = GetUserContext();
      using(ATLANTEntities db = new ATLANTEntities()) {

        SqlParameter pO_ANK_ID = new SqlParameter("@o_ank_id", SqlDbType.Int);
        pO_ANK_ID.Value = o_ank_id;

        SqlParameter pM_ORG_ID = new SqlParameter("@m_org_id", SqlDbType.Int);
        pM_ORG_ID.Value = uc.M_ORG_ID;

        int cnt = db.Database.SqlQuery<int>("exec dbo.HAS_DEYSTV_ABON @o_ank_id = @o_ank_id, @m_org_id = @m_org_id", pO_ANK_ID, pM_ORG_ID).First();
        
        return cnt > 0;

      }

    }

    public JsonResult GetRecordData (string date) {

      DateTime now = CreateDate();

      using (ATLANTEntities db = new ATLANTEntities()) {
        DateTime dt = now;
        if (date != "") {
          try {
            dt = Convert.ToDateTime(date);
          } catch {
            dt = now;
          }
        }

        UserContext uc = GetUserContext();

        SqlParameter pDate = new SqlParameter("@date", dt);
        pDate.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter pMOrgId = new SqlParameter("@m_org_id", uc.M_ORG_ID);
        pMOrgId.SqlDbType = SqlDbType.Int;

        var d = db.Database.SqlQuery<RecordData>("EXEC [dbo].[GET_RECORD_DATA] @date = @date, @m_org_id = @m_org_id", pDate, pMOrgId).ToList();
        return Json(d, JsonRequestBehavior.AllowGet);
      }
    }

    [HttpPost]
    public JsonResult RecordSave(O_SEANS s) {

      DateTime now = CreateDate();

      // избавляюсь от разницы +4 часа
      if(s.SEANS_DATE.HasValue) {
        s.SEANS_DATE = s.SEANS_DATE.Value.ToUniversalTime().Date;
      }
      //
      if (s.D_REG.HasValue) {
        s.D_REG = s.D_REG.Value.ToUniversalTime();
      }
      //
      if (s.D_START.HasValue) {
        s.D_START = s.D_START.Value.ToUniversalTime();
      }

      string message = "", time = "";
      using (ATLANTEntities db = new ATLANTEntities()) {
        UserContext uc = GetUserContext();
        if (s.ID == 0) {  // сохранение новой записи, сеанс состоялся
            var d = db.O_SEANS.Where(x => x.O_ANK_ID == s.O_ANK_ID &&
                                          x.SEANS_DATE.Value.Year == s.SEANS_DATE.Value.Year &&
                                          x.SEANS_DATE.Value.Month == s.SEANS_DATE.Value.Month &&
                                          x.SEANS_DATE.Value.Day == s.SEANS_DATE.Value.Day &&
                                          x.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();
            // уже записан
            if (d == null) {
              s.LANE = 0; // запись из рядов
              s.D_START = now;
              s.USERID = uc.ID;
              s.M_ORG_ID = uc.M_ORG_ID;
              s.D_MODIF = now;
              db.O_SEANS.Add(s);
              db.SaveChanges();
              message = "true";
            } else {
              message = "exists";
              var e = db.M_SEANS_TIME.Where(f => f.ID == d.M_SEANS_TIME_ID).FirstOrDefault();
              time = e.MAX_TIME ?? "";
            }
        } else { // переписываем на другую дату
          var a = db.O_SEANS.Find(s.ID);
          if (s.M_SEANS_TIME_ID == a.M_SEANS_TIME_ID) { // время то же
            if (a.SEANS_DATE.Value.Year == s.SEANS_DATE.Value.Year &&   // запись, в которой меняется дата записи, имеет ту же дату
                a.SEANS_DATE.Value.Month == s.SEANS_DATE.Value.Month &&
                a.SEANS_DATE.Value.Day == s.SEANS_DATE.Value.Day) {
              message = "exists";
              var e = db.M_SEANS_TIME.Where(f => f.ID == s.M_SEANS_TIME_ID).FirstOrDefault();
              time = e.MAX_TIME ?? "";
            } else {
              // пытаемся перенести запись, на день, в котором у человека уже есть запись
              var d = db.O_SEANS.Where(x => x.O_ANK_ID == s.O_ANK_ID &&
                                            x.SEANS_DATE.Value.Year == s.SEANS_DATE.Value.Year &&
                                            x.SEANS_DATE.Value.Month == s.SEANS_DATE.Value.Month &&
                                            x.SEANS_DATE.Value.Day == s.SEANS_DATE.Value.Day &&
                                            x.M_ORG_ID == uc.M_ORG_ID &&
                                            x.ID != a.ID).FirstOrDefault();
              // уже записан
              if (d == null) {
                var b = a;
                b.M_ORG_ID = uc.M_ORG_ID;
                b.USERID = uc.ID;
                b.LANE = 0;

                // сохраняем действие
                O_DEISTV o = new O_DEISTV();
                var e = db.O_ANK.Find(b.O_ANK_ID);
                if (e != null) {
                  o.MESS = uc.UserName + " Перенес(ла) в режиме 'Запись' сеанс " + (e.SURNAME ?? "") + " " + (e.NAME ?? "") + " " + (e.SECNAME ?? "") +
                           " c " + getDateddMMyyyyStr(b.SEANS_DATE) + " на " + getDateddMMyyyyStr(s.SEANS_DATE);
                  o.O_ANK_ID = b.O_ANK_ID;
                  o.M_DEISTV_ID = M_DEISTV_SEANS;
                  o.D_START = CreateDate();
                  o.M_ORG_ID = uc.M_ORG_ID;
                  o.USERID = uc.ID;
                  db.O_DEISTV.Add(o);
                }

                b.SEANS_DATE = s.SEANS_DATE;
                b.M_SEANS_TIME_ID = s.M_SEANS_TIME_ID;
                db.Entry(a).CurrentValues.SetValues(b);
                db.SaveChanges();
                message = "true";
              } else {
                message = "exists";
                var e = db.M_SEANS_TIME.Where(f => f.ID == d.M_SEANS_TIME_ID).FirstOrDefault();
                time = e.MAX_TIME ?? "";
              }
            }
          } else { // время для переноса другое, проверяем существование записи
                   // пытаемся перенести запись, на день, в котором у человека уже есть запись
            var d = db.O_SEANS.Where(x => x.O_ANK_ID == s.O_ANK_ID &&
                                          x.SEANS_DATE.Value.Year == s.SEANS_DATE.Value.Year &&
                                          x.SEANS_DATE.Value.Month == s.SEANS_DATE.Value.Month &&
                                          x.SEANS_DATE.Value.Day == s.SEANS_DATE.Value.Day &&
                                          x.M_ORG_ID == uc.M_ORG_ID &&
                                          x.ID != a.ID).FirstOrDefault();
            // уже записан
            if (d == null) {
              var b = a;
              b.M_ORG_ID = uc.M_ORG_ID;
              b.USERID = uc.ID;
              b.LANE = 0;

              // сохраняем действие
              O_DEISTV o = new O_DEISTV();
              var e = db.O_ANK.Find(b.O_ANK_ID);
              if (e != null) {
                o.MESS = uc.UserName + " Перенес(ла) в режиме 'Запись' сеанс " + (e.SURNAME ?? "") + " " + (e.NAME ?? "") + " " + (e.SECNAME ?? "") +
                         " c " + getDateddMMyyyyStr(b.SEANS_DATE) + " на " + getDateddMMyyyyStr(s.SEANS_DATE);
                o.O_ANK_ID = b.O_ANK_ID;
                o.M_DEISTV_ID = M_DEISTV_SEANS;
                o.D_START = CreateDate();
                o.M_ORG_ID = uc.M_ORG_ID;
                o.USERID = uc.ID;
                db.O_DEISTV.Add(o);
              }

              b.SEANS_DATE = s.SEANS_DATE;
              b.M_SEANS_TIME_ID = s.M_SEANS_TIME_ID;
              db.Entry(a).CurrentValues.SetValues(b);
              db.SaveChanges();
              message = "true";
            } else {
              message = "exists";
              var e = db.M_SEANS_TIME.Where(f => f.ID == d.M_SEANS_TIME_ID).FirstOrDefault();
              time = e.MAX_TIME ?? "";
            }
          }
        }
      }
      return Json(new { success = message, time = time });
    }



    [HttpPost]
    public ActionResult OrgSave(M_ORG m_org/*, IList<O_PRAVO_GR> o_pravo_gr, IList<O_PRAVO_REJ> o_pravo_rej*/) {

      using(ATLANTEntities db = new ATLANTEntities()) {

        // TODO: пока для всех организаций часовой пояс +4, потом
        // надо будет сделать задание часового пояса через настройки
        m_org.TZ = 4;

        // редактирование организации
        if (m_org.ID != 0) {
          db.M_ORG.Remove(db.M_ORG.Find(m_org.ID));

        // новая организация
        } else {
          DbRawSqlQuery<int> newIdList = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_M_ORG_ID as int);");
          int newId = newIdList.First();
          m_org.ID = newId;
        }

        // дилер A может относиться только к Администрации
        // тех. отдел может относиться только к Администрации
        if (new int[] {M_ORG_TYPE_ID_DILER_A, M_ORG_TYPE_ID_TEH_OTDEL}.Any(x => x == m_org.M_ORG_TYPE_ID)) {
          m_org.PARENT_ID = M_ORG_ID_ADMINISTRATSIYA;
        }

        db.M_ORG.Add(m_org);

        //# 380 Если организация неактивна, делаем невозможным вход в нее
        foreach(var u in db.S_USER.Where(x => x.M_ORG_ID == m_org.ID)) {
          var a = db.AspNetUsers.Find(u.AspNetUsersId);

          if (a != null) {
            // организация стала действующей, возвращаем пароль
            if (m_org.DEISTV == 1) {
              // если поле сохранения пароля не заполнено и пароль не заменен
              if (a.OldPasswordHash == null && a.PasswordHash != NEW_PASSWORD_HASH) {
                 a.OldPasswordHash = a.PasswordHash;
              }
              a.PasswordHash = a.OldPasswordHash;
            }

            // организация стала недействующей, меняем пароль
            if (m_org.DEISTV == 0) {
              a.OldPasswordHash = a.PasswordHash;
              a.PasswordHash = NEW_PASSWORD_HASH;
            }
          }
        }

        db.SaveChanges();

      }

      return Json(new {success = "true", data = m_org.NAME});

    }



    // получить дерево организаций 
    [HttpGet]
    public ActionResult GetOrgTree() {

      OrgTreeViewModel tree = new OrgTreeViewModel();
      
    
      using(ATLANTEntities db = new ATLANTEntities()) {
      
        // администрация 
        M_ORG adm = db.M_ORG.Find(1);
        
        if (adm == null) {
          return HttpNotFound("Не найдена организация M_ORG.ID == 1");
        }

        tree.ID = adm.ID;
        tree.NAME = adm.NAME;
        tree.M_ORG_TYPE_ID = adm.M_ORG_TYPE_ID.Value;
        tree.M_ORG_TYPE_ID_NAME = db.M_ORG_TYPE.Find(adm.M_ORG_TYPE_ID).NAME;
        tree.DEISTV = adm.DEISTV;

        // дилер A
        List<OrgTreeViewModel> dilerA =
          (
            from org in db.M_ORG.Where(x => x.PARENT_ID == adm.ID)
            join tname in db.M_ORG_TYPE on org.M_ORG_TYPE_ID equals tname.ID
            select new OrgTreeViewModel {ID = org.ID, M_ORG_TYPE_ID = org.M_ORG_TYPE_ID.Value,
                                         M_ORG_TYPE_ID_NAME = tname.NAME, NAME = org.NAME, DEISTV = org.DEISTV}
          ).ToList()
        ;

        tree.childs = dilerA;

        // дилер C или D (второй уровень)
        List<OrgTreeViewModel> dilerCD = new List<OrgTreeViewModel>();
        IEnumerable<OrgTreeViewModel> dilerCDAll = new List<OrgTreeViewModel>();
        foreach(OrgTreeViewModel item in dilerA) {
          dilerCD =
            (
              from org in db.M_ORG.Where(x => x.PARENT_ID == item.ID)
              join tname in db.M_ORG_TYPE on org.M_ORG_TYPE_ID equals tname.ID
              select new OrgTreeViewModel {ID = org.ID, M_ORG_TYPE_ID = org.M_ORG_TYPE_ID.Value,
                                           M_ORG_TYPE_ID_NAME = tname.NAME, NAME = org.NAME, DEISTV = org.DEISTV}
            ).ToList()
          ;

          item.childs = dilerCD;
          dilerCDAll = dilerCDAll.Union(dilerCD);

        }

        // дилер D (третий уровень)
        List<OrgTreeViewModel> dilerD;
        foreach(OrgTreeViewModel item in dilerCDAll) {
          dilerD =
            (
              from org in db.M_ORG.Where(x => x.PARENT_ID == item.ID)
              join tname in db.M_ORG_TYPE on org.M_ORG_TYPE_ID equals tname.ID
              select new OrgTreeViewModel {ID = org.ID, M_ORG_TYPE_ID = org.M_ORG_TYPE_ID.Value,
                                           M_ORG_TYPE_ID_NAME = tname.NAME, NAME = org.NAME, DEISTV = org.DEISTV}
            ).ToList()
          ;

          item.childs = dilerD;

        }

      }

      return Content(JsonConvert.SerializeObject(tree), "application/json");

    }

    [HttpPost]
    public JsonResult SaveManualName (int id, string name, string manual) {
      string message = "true", data = manual;
      using (ATLANTEntities db = new ATLANTEntities()) {
        UserContext uc = GetUserContext();
        if (id == 0) {
          if (manual.ToUpper() == "M_ZABOL_GROUP") {
            var a = db.M_ZABOL_GROUP.Where(x => x.NAME.ToUpper() == name.ToUpper()).FirstOrDefault();
            if (a != null) {
              message = "exists";
            } else {
              M_ZABOL_GROUP z = new M_ZABOL_GROUP();
              z.NAME = name;
              z.M_ORG_ID = uc.M_ORG_ID;
              db.M_ZABOL_GROUP.Add(z);
            }
          } else if (manual.ToUpper() == "M_RYAD") {
            var a = db.M_RYAD.Where(x => x.NAME.ToUpper() == name.ToUpper()).FirstOrDefault();
            if (a != null) {
              message = "exists";
            } else {
              M_RYAD z = new M_RYAD();
              z.NAME = name;
              db.M_RYAD.Add(z);
            }
          } else if (manual.ToUpper() == "M_PRICH_ISKL") {
            var a = db.M_PRICH_ISKL.Where(x => x.NAME.ToUpper() == name.ToUpper()).FirstOrDefault();
            if (a != null) {
              message = "exists";
            } else {
              M_PRICH_ISKL z = new M_PRICH_ISKL();
              z.NAME = name;
              z.M_ORG_ID = uc.M_ORG_ID;
              db.M_PRICH_ISKL.Add(z);
            }
          } else if (manual.ToUpper() == "M_IST_INF") {
            var a = db.M_IST_INF.Where(x => x.NAME.ToUpper() == name.ToUpper()).FirstOrDefault();
            if (a != null) {
              message = "exists";
            } else {
              M_IST_INF z = new M_IST_INF();
              z.NAME = name;
              z.M_ORG_ID = uc.M_ORG_ID;
              db.M_IST_INF.Add(z);
            }
          } else if (manual.ToUpper() == "M_METOD_OPL") {
            var a = db.M_METOD_OPL.Where(x => x.NAME.ToUpper() == name.ToUpper()).FirstOrDefault();
            if (a != null) {
              message = "exists";
            } else {
              M_METOD_OPL z = new M_METOD_OPL();
              z.NAME = name;
              z.M_ORG_ID = uc.M_ORG_ID;
              db.M_METOD_OPL.Add(z);
            }
          } else if (manual.ToUpper() == "S_USER_ROLE") {
            var a = db.S_USER_ROLE.Where(x => x.NAME.ToUpper() == name.ToUpper()).FirstOrDefault();
            if (a != null) {
              message = "exists";
            } else {
              S_USER_ROLE z = new S_USER_ROLE();
              z.NAME = name;
              z.M_ORG_ID = uc.M_ORG_ID;
              db.S_USER_ROLE.Add(z);
            }
          } else if (manual.ToUpper() == "M_STATUS"){
            var a = db.M_STATUS.Where(x => x.NAME.ToUpper() == name.ToUpper()).FirstOrDefault();
            if (a != null) {
              message = "exists";
            } else {
              M_STATUS z = new M_STATUS();
              z.NAME = name;
              z.M_ORG_ID = uc.M_ORG_ID;
              db.M_STATUS.Add(z);
            }
          } else if (manual.ToUpper() == "M_SERVICE_TYPE") {
            var a = db.M_SERVICE_TYPE.Where(x => x.NAME.ToUpper() == name.ToUpper()).FirstOrDefault();
            if (a != null) {
              message = "exists";
            } else {
              M_SERVICE_TYPE z = new M_SERVICE_TYPE();
              z.NAME = name;
              z.M_ORG_ID = uc.M_ORG_ID;
              db.M_SERVICE_TYPE.Add(z);
            }
          } else if (manual.ToUpper() == "M_RASHOD_STAT") {
            var a = db.M_RASHOD_STAT.Where(x => x.NAME.ToUpper() == name.ToUpper()).FirstOrDefault();
            if (a != null) {
              message = "exists";
            } else {
              M_RASHOD_STAT z = new M_RASHOD_STAT();
              z.NAME = name;
              z.M_ORG_ID = uc.M_ORG_ID;
              db.M_RASHOD_STAT.Add(z);
            }
          } else if (manual.ToUpper() == "M_PRODUCT") {
            var a = db.M_PRODUCT.Where(x => x.NAME.ToUpper() == name.ToUpper()).FirstOrDefault();
            if (a != null) {
              message = "exists";
            } else {
              M_PRODUCT z = new M_PRODUCT();
              z.NAME = name;
              if (z.NAME.ToUpper().IndexOf("абон".ToUpper()) != -1) {
                z.IS_ABON = 1;
              }
              db.M_PRODUCT.Add(z);
            }
          } else if (manual.ToUpper() == "M_DEISTV") {
            var a = db.M_DEISTV.Where(x => x.NAME.ToUpper() == name.ToUpper()).FirstOrDefault();
            if (a != null) {
              message = "exists";
            } else {
              M_DEISTV z = new M_DEISTV();
              z.NAME = name;
              z.M_ORG_ID = uc.M_ORG_ID;
              db.M_DEISTV.Add(z);
            }
          } else if (manual.ToUpper() == "M_VID_SOB") {
            var a = db.M_VID_SOB.Where(x => x.NAME.ToUpper() == name.ToUpper()).FirstOrDefault();
            if (a != null) {
              message = "exists";
            } else {
              M_VID_SOB z = new M_VID_SOB();
              z.NAME = name;
              z.M_ORG_ID = uc.M_ORG_ID;
              db.M_VID_SOB.Add(z);
            }
          } else if (manual.ToUpper() == "M_VOPROS") {
            var a = db.M_VID_SOB.Where(x => x.NAME.ToUpper() == name.ToUpper()).FirstOrDefault();
            if (a != null) {
              message = "exists";
            } else {
              M_VOPROS z = new M_VOPROS();
              z.NAME = name;
              z.M_ORG_ID = uc.M_ORG_ID;
              db.M_VOPROS.Add(z);
            }
          } else if (manual.ToUpper() == "M_KONT_STATUS") {
            var a = db.M_KONT_STATUS.Where(x => x.NAME.ToUpper() == name.ToUpper()).FirstOrDefault();
            if (a != null) {
              message = "exists";
            } else {
              M_KONT_STATUS z = new M_KONT_STATUS();
              z.NAME = name;
              z.M_ORG_ID = uc.M_ORG_ID;
              db.M_KONT_STATUS.Add(z);
            }
          } else if (manual.ToUpper() == "M_KONT_IST") {
            var a = db.M_KONT_IST.Where(x => x.NAME.ToUpper() == name.ToUpper()).FirstOrDefault();
            if (a != null) {
              message = "exists";
            } else {
              M_KONT_IST z = new M_KONT_IST();
              z.NAME = name;
              z.M_ORG_ID = uc.M_ORG_ID;
              db.M_KONT_IST.Add(z);
            }
          } else if (manual.ToUpper() == "M_SOPR_FORM_OPL") {
            var a = db.M_SOPR_FORM_OPL.Where(x => x.NAME.ToUpper() == name.ToUpper()).FirstOrDefault();
            if (a != null) {
              message = "exists";
            } else {
              M_SOPR_FORM_OPL z = new M_SOPR_FORM_OPL();
              z.NAME = name;
              z.M_ORG_ID = uc.M_ORG_ID;
              db.M_SOPR_FORM_OPL.Add(z);
            }
          } else if (manual.ToUpper() == "M_SOPR_PRODUCT") {
            var a = db.M_SOPR_PRODUCT.Where(x => x.NAME.ToUpper() == name.ToUpper()).FirstOrDefault();
            if (a != null) {
              message = "exists";
            } else {
              M_SOPR_PRODUCT z = new M_SOPR_PRODUCT();
              z.NAME = name;
              z.M_ORG_ID = uc.M_ORG_ID;
              db.M_SOPR_PRODUCT.Add(z);
            }
          } else if (manual.ToUpper() == "M_SOPR_STATUS") {
            var a = db.M_SOPR_STATUS.Where(x => x.NAME.ToUpper() == name.ToUpper()).FirstOrDefault();
            if (a != null) {
              message = "exists";
            } else {
              M_SOPR_STATUS z = new M_SOPR_STATUS();
              z.NAME = name;
              z.M_ORG_ID = uc.M_ORG_ID;
              db.M_SOPR_STATUS.Add(z);
            }
          } else if (manual.ToUpper() == "M_SOPR_DOP") {
            var a = db.M_SOPR_DOP.Where(x => x.NAME.ToUpper() == name.ToUpper()).FirstOrDefault();
            if (a != null) {
              message = "exists";
            } else {
              M_SOPR_DOP z = new M_SOPR_DOP();
              z.NAME = name;
              z.M_ORG_ID = uc.M_ORG_ID;
              db.M_SOPR_DOP.Add(z);
            }
          } else if (manual.ToUpper() == "M_SMS_TEMPLATE_TYPE") {
            var a = db.M_SMS_TEMPLATE_TYPE.Where(x => x.NAME.ToUpper() == name.ToUpper()).FirstOrDefault();
            if (a != null) {
              message = "exists";
            } else {
              M_SMS_TEMPLATE_TYPE z = new M_SMS_TEMPLATE_TYPE();
              z.NAME = name;
              z.M_ORG_ID = uc.M_ORG_ID;
              db.M_SMS_TEMPLATE_TYPE.Add(z);
            }
          }


          if (message == "true") db.SaveChanges();
        } else {

          SqlParameter _name = new SqlParameter("@name", name);
          SqlParameter _id = new SqlParameter("@id", id);

          var i = db.Database.ExecuteSqlCommand(
            "select 1 from dbo." + manual + " where name = @name and id != @id", _name, _id
          );

          if (i > 0) {
            message = "exists";
          } else {
            SqlParameter name_ = new SqlParameter("@name", name);
            SqlParameter id_ = new SqlParameter("@id", id);

            db.Database.ExecuteSqlCommand(
              "update dbo." + manual + "\r\n" +
              "set name = @name" + "\r\n" +
              "where id = @id",
              name_,
              id_
            );
            message = "true";
          }
        }
      }
      return Json(new { success = message, data = data });
    }


    // получить права на группы для пользователя
    // S_USER_ID - S_USER.ID
    [HttpGet]
    public ActionResult GetO_PRAVO_GR(int? S_USER_ID) {


      if (S_USER_ID == null) {
        return HttpNotFound();
      }

      using (ATLANTEntities db = new ATLANTEntities()) {

        List<O_PRAVO_GR> a;
        a = db.O_PRAVO_GR.Where(x => x.S_USER_ID == S_USER_ID).ToList();

        return Content(JsonConvert.SerializeObject(a), "application/json");

      }
      
    }


    // получить права на режим для пользователя
    // S_USER_ID - S_USER.ID
    [HttpGet]
    public ActionResult GetO_PRAVO_REJ(int? S_USER_ID) {
    
      if (S_USER_ID == null) {
        return HttpNotFound();
      }

      using (ATLANTEntities db = new ATLANTEntities()) {

        List<O_PRAVO_REJ> a;
        a = db.O_PRAVO_REJ.Where(x => x.S_USER_ID == S_USER_ID).ToList();

        return Content(JsonConvert.SerializeObject(a), "application/json");

      }

    }

    [HttpPost]
    public JsonResult SaveSeansTime(M_SEANS_TIME s) {
      string message = "true";
      using (ATLANTEntities db = new ATLANTEntities()) {
        UserContext uc = GetUserContext();
        s.M_ORG_ID = uc.M_ORG_ID;
        if (s.ID == 0) {
          var a = db.M_SEANS_TIME.Where(b => (b.MIN_TIME == s.MIN_TIME || b.MAX_TIME == s.MAX_TIME) && 
                                        b.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();
          if (a != null) {
            message = "exists";
          } else {
            db.M_SEANS_TIME.Add(s);
            db.SaveChanges();
          }
        } else {
          var a = db.M_SEANS_TIME.Where(b => (b.MIN_TIME == s.MIN_TIME || b.MAX_TIME == s.MAX_TIME) && 
                                             b.M_ORG_ID == uc.M_ORG_ID && 
                                             b.ID != s.ID).FirstOrDefault();
          if (a != null) {
            message = "exists";
          } else {
            var t = db.M_SEANS_TIME.Find(s.ID);
            db.Entry(t).CurrentValues.SetValues(s);
            db.SaveChanges();
          }
        }
      }
      return Json(new { success = message });
    }

    [HttpPost]
    public JsonResult SaveWorkDay(M_WORK_DAY s) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        UserContext uc = GetUserContext();
        if (s.NAME == "delete") {
          s.M_ORG_ID = uc.M_ORG_ID;
          var d = db.M_WORK_DAY.Where(a => a.M_ORG_ID == uc.M_ORG_ID && a.DAY_ID == s.DAY_ID).FirstOrDefault();
          if (d != null) {
            db.M_WORK_DAY.Remove(d);
          }
        } else {
          s.M_ORG_ID = uc.M_ORG_ID;
          db.M_WORK_DAY.Add(s);
        }
        db.SaveChanges();
      }
      return Json(new { success = "true" });
    }

    // добавить нового пользователя
    [HttpPost]
    public ActionResult AddUser(S_USER s_user, string PASSWORD, string UserName, string base64Photo,
                                IList<O_PRAVO_GR> o_pravo_gr, IList<O_PRAVO_REJ> o_pravo_rej)
    {

      if (String.IsNullOrEmpty(s_user.SURNAME)) {
       return Content(JsonConvert.SerializeObject(new { success = false, error = "Необходимо указать фамилию" }),"application/json"); 
      }

      if (String.IsNullOrEmpty(s_user.NAME)) {
       return Content(JsonConvert.SerializeObject(new { success = false, error = "Необходимо указать имя" }),"application/json"); 
      }

      if (String.IsNullOrEmpty(UserName)) {
       return Content(JsonConvert.SerializeObject(new { success = false, error = "Необходимо указать имя входа" }),"application/json"); 
      }

      if (s_user.ID == 0) {
        if (String.IsNullOrEmpty(PASSWORD)) {
         return Content(JsonConvert.SerializeObject(new { success = false, error = "Необходимо указать пароль" }),"application/json"); 
        }
      }

      // избавляюсь от разницы +4 часа
      if (s_user.D_START.HasValue) {
        s_user.D_START = s_user.D_START.Value.ToUniversalTime();
      }
      //
      if (s_user.BIRTHDAY.HasValue) {
        s_user.BIRTHDAY = s_user.BIRTHDAY.Value.ToUniversalTime();
      }
      //
      if (s_user.HIRE_DATE.HasValue) {
        s_user.HIRE_DATE = s_user.HIRE_DATE.Value.ToUniversalTime();
      }

      if (s_user.DISMISS_DATE.HasValue) {
        s_user.DISMISS_DATE = s_user.DISMISS_DATE.Value.ToUniversalTime();
      }

      // если новый пользователь, то создаю его в системной .NET-таблице
      // пользователей Identity
      if (s_user.ID == 0) {      

        var manager = new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(ApplicationDbContext.Create()));
        var user = new ApplicationUser() { Email = "without@email.ru",UserName = UserName };
        var result = manager.Create(user, PASSWORD);

        if(result.Succeeded) {
          string newId = user.Id;
          s_user.AspNetUsersId = user.Id;
        } else {
          return Content(JsonConvert.SerializeObject(new { success = false, error = result.Errors }),"application/json");
        }

      }

      using(ATLANTEntities db = new ATLANTEntities()) {

        DateTime now = CreateDate();

        // фото передается как base64, сначала декодирую
        if (!String.IsNullOrEmpty(base64Photo)) {
          s_user.PHOTO = Convert.FromBase64String(base64Photo);
        }

        // если редактирование ползователя, то удаляю
        // существующую запись, чтобы заново добавить
        if (s_user.ID != 0) {

          S_USER u = db.S_USER.Find(s_user.ID);
          
          // чтобы не потерялся пароль для звонков при редактировании
          if (u.SIP_PASSWORD != null && s_user.SIP_PASSWORD == null) {
            s_user.SIP_PASSWORD = u.SIP_PASSWORD;
          }
          
          if (u != null) {
            db.S_USER.Remove(u);
            db.SaveChanges();
          }

        // если пользователь новый, задаю идентификатор
        } else {

          DbRawSqlQuery<int> newIdList = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_S_USER_ID as int);");
          int newId = newIdList.First();
          s_user.ID = newId;

        }

        // удаляю все права на группы и на режимы
        db.O_PRAVO_GR.RemoveRange(db.O_PRAVO_GR.Where(x => x.S_USER_ID == s_user.ID));
        db.O_PRAVO_REJ.RemoveRange(db.O_PRAVO_REJ.Where(x => x.S_USER_ID == s_user.ID));

        s_user.D_START = now;

        // если пользователя добавляют в организацию администрации, ставлю
        // специальный признак, который позволяет перемещаться по магазинам
        var m_org = db.M_ORG.Find(s_user.M_ORG_ID);
        int m_org_type_id = 0;
        if (m_org != null && m_org.M_ORG_TYPE_ID.HasValue) {
          m_org_type_id = m_org.M_ORG_TYPE_ID.Value;
        }

        if (m_org_type_id == M_ORG_TYPE_ID_ADMINISTRATSIYA) {
          s_user.IS_ADM = 1;
        }
        // для дилеров А И С - свой признак
        if (m_org_type_id == M_ORG_TYPE_ID_DILER_A) {
          s_user.IS_DILER_A = 1;
          s_user.M_ORG_ID_DILER_A = s_user.M_ORG_ID;
        }

        if (m_org_type_id == M_ORG_TYPE_ID_DILER_C) {
          s_user.IS_DILER_C = 1;
          s_user.M_ORG_ID_DILER_C = s_user.M_ORG_ID;
        }


        // добавляю пользователя
        db.S_USER.Add(s_user);

        // #380
        // сохраняем пароль для последующего возврата при активной/неактивной организации
        var asp = db.AspNetUsers.Find(s_user.AspNetUsersId);
        if (asp != null) {
          asp.OldPasswordHash = asp.PasswordHash;
        }

        
        // выбранные права для групп
        if (o_pravo_gr != null) {

          foreach(var item in o_pravo_gr) {
            item.S_USER_ID = s_user.ID;
          }

          db.O_PRAVO_GR.AddRange(o_pravo_gr);

        }

        // выбранные права для режимов
        if (o_pravo_rej != null) {

          foreach(var item in o_pravo_rej) {
            item.S_USER_ID = s_user.ID;
          }

          db.O_PRAVO_REJ.AddRange(o_pravo_rej);

        }
        

        db.SaveChanges();

        // привожу все права в порядок, ни у одного сотрудника не должно остаться больше
        // прав, чем у директора, если у директора право было убрано, оно убирётся у
        // всех сотрудников

        // для техотдела такая проверка не нужна
        UserContext uc = GetUserContext();
        if (uc.M_ORG_TYPE_ID != M_ORG_TYPE_ID_TEH_OTDEL) {
          db.Database.ExecuteSqlCommand("exec dbo.SET_RIGHTS_AFTER_DIREKTOR_EDIT @m_org_id = @m_org_id", new SqlParameter("@m_org_id", s_user.M_ORG_ID));
        }

      }

      return Content(JsonConvert.SerializeObject(new { success = true, userId = s_user.AspNetUsersId, ID = s_user.ID }),"application/json");

    }


    // отредактировать пользователя
    [HttpPost]
    public ActionResult EditUser(S_USER s_user, string PASSWORD, string UserName, string base64Photo,
                                 IList<O_PRAVO_GR> o_pravo_gr, IList<O_PRAVO_REJ> o_pravo_rej)
    {

      // тоже самое, что и редактирование
      return AddUser(s_user: s_user, PASSWORD: PASSWORD, UserName: UserName, base64Photo: base64Photo,
                     o_pravo_gr: o_pravo_gr, o_pravo_rej: o_pravo_rej);

    }


    // изменить пароль пользователя
    [HttpPost]
    public ActionResult ChangePassword(S_USER s_user, string PASSWORD, string UserName, string base64Photo) {

      var manager = new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(ApplicationDbContext.Create()));
      var user = manager.FindById(s_user.AspNetUsersId);
      if(user == null) {
        return HttpNotFound();
      }
      user.PasswordHash = manager.PasswordHasher.HashPassword(PASSWORD);
      var result = manager.Update(user);

      if(result.Succeeded) {
        string newId = user.Id;
      } else {
        return Content(JsonConvert.SerializeObject(new { success = false, error = result.Errors }),"application/json");
      }

      return Content(JsonConvert.SerializeObject(new { success = true, userId = user.Id, ID = s_user.ID }),"application/json");

    }


    // удалить пользователя
    [HttpPost]
    public ActionResult RemoveUser(S_USER s_user) {

      var manager = new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(ApplicationDbContext.Create()));
      var user = manager.FindById(s_user.AspNetUsersId);
      if(user == null) {
        return HttpNotFound();
      }

      // запрещаю удалять пользователя Admin, это несколько раз уже делали
      if (user.UserName.ToUpper() == "Admin".ToUpper()) {
        throw new Exception("Пользователь Admin не может быть удалён");
      }

      var result = manager.Delete(user);

      if(!result.Succeeded) {
        return Content(JsonConvert.SerializeObject(new { success = false, error = result.Errors }),"application/json");
      }

      using(ATLANTEntities db = new ATLANTEntities()) {

        S_USER u = db.S_USER.Find(s_user.ID);
        if (u == null) {
          return HttpNotFound();
        } else {
          db.O_PRAVO_GR.RemoveRange(db.O_PRAVO_GR.Where(x => x.S_USER_ID == u.ID));
          db.O_PRAVO_REJ.RemoveRange(db.O_PRAVO_REJ.Where(x => x.S_USER_ID == u.ID));
          // не удаляем, а увольняем
          u.DISMISS_DATE = CreateDate();
          // db.S_USER.Remove(u);
          db.SaveChanges();
        }

      }

      return Content(JsonConvert.SerializeObject(new { success = true}),"application/json");

    }

    // изменить должность пользователя
    [HttpPost]
    public ActionResult UserChangeRole(S_USER u) {

      using(ATLANTEntities db = new ATLANTEntities()) {

        S_USER user = db.S_USER.Find(u.ID);

        if (user == null) {
          return HttpNotFound("Пользователь не найден: ID = " + u.ID);
        }

        user.S_USER_ROLE_ID = u.S_USER_ROLE_ID;

        db.SaveChanges();

      }

      return Content(JsonConvert.SerializeObject(new { success = true, userId = u.ID }), "application/json");

    }


    // получить фото пользователя
    // id - O_ANK.ID
    [HttpGet]
    public ActionResult GetUserPhoto(int id) {

      using (ATLANTEntities db = new ATLANTEntities()) {

        S_USER a;
        a = db.S_USER.Find(id);

        if (a == null) {
          return HttpNotFound();
        }

        if (a.PHOTO != null) {
          return File(a.PHOTO, "image/jpg");
        } else {
          return File(System.IO.File.ReadAllBytes(Server.MapPath("~") + EMPTY_PHOTO), "image/png");
        }

      }

    }


    // получить информацию о текущем пользователе
    [HttpGet]
    public ActionResult GetUserContextRequest() {

      UserContext userContext = GetUserContext();
      return Content(JsonConvert.SerializeObject(userContext), "application/json");   

    }


    public UserContext GetUserContext() {

      using (ATLANTEntities db = new ATLANTEntities()) {

        string aspNetUserId = User.Identity.GetUserId();

        var userContext = db.AspNetUsers.Where(x => x.Id == aspNetUserId)
          .Join(db.S_USER, asp => asp.Id, s_user => s_user.AspNetUsersId, (asp, s_user) => new {
              AspNetUsers = asp,
              S_USER = s_user
          })
          .Join(db.S_USER_ROLE, x => x.S_USER.S_USER_ROLE_ID, s_user_role => s_user_role.ID, (x, s_user_role) => new {
            AspNetUsers = x.AspNetUsers,
            S_USER = x.S_USER,
            S_USER_ROLE = s_user_role
          })
          .Join(db.M_ORG, x => x.S_USER.M_ORG_ID, m_org => m_org.ID, (x, m_org) => new {
            AspNetUsers = x.AspNetUsers,
            S_USER = x.S_USER,
            S_USER_ROLE = x.S_USER_ROLE,
            M_ORG = m_org
          })
          .Join(db.M_ORG_TYPE, x => x.M_ORG.M_ORG_TYPE_ID, m_org_type => m_org_type.ID, (x, m_org_type) => new {
            AspNetUsers = x.AspNetUsers,
            S_USER = x.S_USER,
            S_USER_ROLE = x.S_USER_ROLE,
            M_ORG = x.M_ORG,
            M_ORG_TYPE = m_org_type
          })
          .Select(x => new UserContext{
              ID = x.S_USER.ID,
              S_USER_ROLE_ID = x.S_USER.S_USER_ROLE_ID,
              S_USER_ROLE_ID_NAME = x.S_USER_ROLE.NAME,
              SURNAME = x.S_USER.SURNAME,
              NAME = x.S_USER.NAME,
              SECNAME = x.S_USER.SECNAME,
              M_ORG_ID = x.S_USER.M_ORG_ID.Value,
              M_ORG_ID_NAME = x.M_ORG.NAME,
              AspNetUsersId = x.S_USER.AspNetUsersId,
              UserName = x.AspNetUsers.UserName,
              M_ORG_TYPE_ID = x.M_ORG_TYPE.ID,
              M_ORG_TYPE_ID_NAME = x.M_ORG_TYPE.NAME,
              fio = (x.S_USER.SURNAME ?? "") + " " + (x.S_USER.NAME ?? "") + " " + (x.S_USER.SECNAME ?? ""),
              M_ORG_ADRES = x.M_ORG.ADRES,
              M_ORG_PHONE = x.M_ORG.PHONE,
              IS_ADM = x.S_USER.IS_ADM,
              IS_DILER_A = x.S_USER.IS_DILER_A,
              IS_DILER_C = x.S_USER.IS_DILER_C,
              M_ORG_ID_DILER_A = (x.S_USER.M_ORG_ID_DILER_A ?? x.S_USER.M_ORG_ID.Value),
              M_ORG_ID_DILER_C = (x.S_USER.M_ORG_ID_DILER_C ?? x.S_USER.M_ORG_ID.Value),
              PARENT_M_ORG_ID = x.M_ORG.PARENT_ID
          }).First();

        // наименование родительской (головной) организации
        if (userContext != null) {
          var p = db.M_ORG.Where(x => x.ID == userContext.PARENT_M_ORG_ID).FirstOrDefault();
          if (p != null) {
            userContext.PARENT_M_ORG_ID_NAME = p.NAME;
            userContext.PARENT_M_ORG_TYPE_ID = p.M_ORG_TYPE_ID.Value;
          }
        }
          
        return userContext;   

      }

    }

    // сохраним место сеанса
    [HttpPost]
    public ActionResult SaveSeansPlace(M_SEANS_PLACE p) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        UserContext uc = GetUserContext();
        p.M_ORG_ID = uc.M_ORG_ID;
        if (p.ID == 0) {
          db.M_SEANS_PLACE.Add(p);
          db.SaveChanges();
        } else {
          var s = db.M_SEANS_PLACE.Find(p.ID);
          db.Entry(s).CurrentValues.SetValues(p);
          db.SaveChanges();
        }
      }
      return Json(new { success = "true" });
    }

    // сохраним место сеанса
    [HttpPost]
    public ActionResult SaveZabol(M_ZABOL z) {
      string message = "true";
      using (ATLANTEntities db = new ATLANTEntities()) {
        UserContext uc = GetUserContext();
        if (z.ID == 0) {
          var d = db.M_ZABOL.Where(a => a.NAME.ToUpper() == z.NAME.ToUpper()).FirstOrDefault();
        
          if (d != null) {
            message = "exists";
          } else {
            z.M_ORG_ID = uc.M_ORG_ID;
            db.M_ZABOL.Add(z);
            db.SaveChanges();
          }
        } else {
          var d = db.M_ZABOL.Where(a => a.NAME.ToUpper() == z.NAME.ToUpper() && 
                                        a.M_ZABOL_GROUP_ID == z.M_ZABOL_GROUP_ID &&
                                        a.ID != z.ID).FirstOrDefault();

          if (d != null) {
            message = "exists";
          } else {
            var s = db.M_ZABOL.Find(z.ID);
            z.M_ORG_ID = uc.M_ORG_ID;
            db.Entry(s).CurrentValues.SetValues(z);
            db.SaveChanges();
          }
        }
      }
      return Json(new { success = message });
    }

    // получить информацию о салонах для дилера A или дилера C
    [HttpGet]
    public ActionResult GetSaloni(int M_ORG_ID, DateTime? fromDate, DateTime? toDate) {

      // избавляюсь от разницы +4 часа
      toDate = toDate.Value.ToUniversalTime();

      // #348 Для режима «Дилер федеральный» сделать выбор периода
      // для дилера С остается за один день
      if (!toDate.HasValue) {
        toDate = CreateDate();
      }

      if (!fromDate.HasValue) {
        fromDate = toDate;
      }

      fromDate = new DateTime(fromDate.Value.Year, fromDate.Value.Month, fromDate.Value.Day, 0, 0, 0);
      toDate = new DateTime(toDate.Value.Year, toDate.Value.Month, toDate.Value.Day, 0, 0, 0);

      using (ATLANTEntities db = new ATLANTEntities()) {

        IEnumerable<M_ORG> all = null;
      
        int m_org_type_id = db.M_ORG.Find(M_ORG_ID).M_ORG_TYPE_ID.Value;

        // если это дилер A
        if (m_org_type_id == M_ORG_TYPE_ID_DILER_A) {

          // салоны C
          var listC = db.M_ORG.Where(x => x.PARENT_ID == M_ORG_ID && x.DEISTV == 1);

          // салоны D
          var listD = db.M_ORG.Where(x => listC.Any(y => x.PARENT_ID == y.ID && x.DEISTV == 1));

          all = listC.Union(listD).ToList();

          // если Дилер C
        } else if (m_org_type_id == M_ORG_TYPE_ID_DILER_C) {

          // у дилера C могуть быть только салоны дилера D в подчинении,
          // и только непосредственно дочерними
          all = db.M_ORG.Where(x => x.PARENT_ID == M_ORG_ID && x.DEISTV == 1).ToList();

        } else {
          return HttpNotFound("Недопустимый тип дилера, должен быть Дилер A или Дилер C! M_ORG_ID = " + M_ORG_ID);
        }

        // #348 Для режима «Дилер федеральный» сделать выбор периода
        // чтоб не ломать конструкцию получения данных при помощи лямбда-функций, с одним параметром даты
        // вызываем аналогичные функции, но с двумя датами
        List<SaloniData> sd = new List<SaloniData>();

        foreach(var a in all.ToList()) {
          DateTime dt = fromDate.Value;
          SaloniData s = new SaloniData() {
            M_ORG_ID = a.ID
          };

          s.NAPOL = dgGetNapolnPeriod(a.ID, fromDate.Value, toDate.Value);
          s.NOV_POSET_COUNT = dgGetNovPosetCountPeriod(a.ID, fromDate.Value, toDate.Value);
          s.ZVONKI_COUNT = dgGetZvonkiCountPeriod(a.ID, fromDate.Value, toDate.Value);
          s.SOTRUD_COUNT = dgGetSotrudCountPeriod(a.ID, fromDate.Value, toDate.Value);
          s.KONT_COUNT = dgGetKontCountPeriod(a.ID, fromDate.Value, toDate.Value);

          sd.Add(s);
        }

        var result = (
          from x in all
          join s in sd on x.ID equals s.M_ORG_ID into ss
          from o in ss.DefaultIfEmpty()
          where x.M_ORG_TYPE_ID != M_ORG_TYPE_ID_DILER_C // дилера С дилера А исключаем
          select 
          new {
                        
            m_org_id = x.ID,

            name = x.NAME,

            adres = x.ADRES,

            napol = o.NAPOL,

            novPosetCount = o.NOV_POSET_COUNT,

            zvonkiCount = o.ZVONKI_COUNT,

            sotrudCount = o.SOTRUD_COUNT,

            kontCount = o.KONT_COUNT,

            prodajiCount = GetSkladRasProductProdan(db, x.ID, fromDate.Value, toDate.Value).Count(),

            prodajiPlanCount = GetProdajiPlanCount(db, x.ID, fromDate.Value, toDate.Value),

            valovDohod = GetOtchetBuhData(fromDate, toDate, 0, x.ID).VALOV_DOHOD,

            rashod = GetRasDokRashod(db, x.ID, fromDate.Value, toDate.Value).Sum(u => u.RASHOD),

            sklad = GetSkladData(x.ID),

            dilerCAccess = db.O_NASTR.Where(x1 => x1.M_ORG_ID == x.ID).FirstOrDefault()?.DILER_C_ACCESS ?? 0

          });
        
        return Content(JsonConvert.SerializeObject(result), "application/json");

      }

    }


    
    //// вернуть начало и конец недели по Календарю продаж
    // workDays - рабочие дни
    // dateStart - с какой даты искать неделю
    // dPeriodS - границы поиска, с
    // dPeriodPo - границы поиска, по
    // date0 - найденная неделя, начало
    // date1 - найденная неделя, конец
    private void getKPNextWeekBeginAndEnd(
        List<M_WORK_DAY> workDays, DateTime dateStart,
        DateTime dPeriodS, DateTime dPeriodPo,
        out DateTime? date0, out DateTime? date1)
    {

      date0 = null;
      date1 = null;

      // возможно dateStart равна выходному, ищу первый рабочий день
      for (DateTime? date = dateStart; date <= dPeriodPo; date = date?.AddDays(1)) {
        int dayOfWeek = (int)(date?.DayOfWeek);
        if (dayOfWeek == 0) {
          dayOfWeek = 7;
        }
        if (workDays.Any(x => x.DAY_ID == dayOfWeek)) {
          date0 = date.Value;
          break;
        }          
      }

      // если так получилось, что начало недели
      // найти не удалось, значит и конец недели
      // смысла искать нету
      if (date0 == null) {
        return;
      }


      // теперь иду до певого выходного, чтобы найти конец недели
      for (DateTime? date = date0; date <= dPeriodPo; date = date?.AddDays(1)) {

        int dayOfWeek = (int)(date?.DayOfWeek);
        if (dayOfWeek == 0) {
          dayOfWeek = 7;
        }
        // выходной - неделя кончилась
        if (!workDays.Any(x => x.DAY_ID == dayOfWeek)) {          
          date1 = date?.AddDays(-1);
          break;
        }

      }

      // последняя неделя периода может кончиться прямо в среду, в любой день,
      // и если мы до выходного не дошли, значит надо вернуть дату, которой
      // заканчивается период
      if (date1 == null) {
        int dayOfWeek = (int)(dPeriodPo.DayOfWeek);
        if (dayOfWeek == 0) {
          dayOfWeek = 7;
        }

        if (workDays.Any(x => x.DAY_ID == dayOfWeek)) {
          date1 = dPeriodPo;
        }

      } 


     
    }



    // получить полностью проданный товар за период
    private IQueryable<O_SKLAD_RAS_PRODUCT> GetSkladRasProductProdan(
        ATLANTEntities db, int m_org_id, DateTime dateS, DateTime datePo)
    {

      return 
        db.O_SKLAD_RAS_PRODUCT
          .Where(x => x.M_ORG_ID == m_org_id &&
                      x.OPL_OST == 0 &&
                      x.COST > 0 && // отсекаю подарки
                      x.D_VID >= dateS &&
                      x.D_VID <= datePo)
      ;

      

    }


    // получить количество запланированных (план) прожад товара за период
    private int GetProdajiPlanCount(
        ATLANTEntities db, int m_org_id, DateTime dateS, DateTime datePo)
    {
        // статусы запланированных прода
        int[] stAr = {M_STATUS_ID_POTEN_POKUP, M_STATUS_ID_PREDOPL};
        return db.O_ANK
            .Where(x => x.M_ORG_ID == m_org_id)
            .Join(db.O_STATUS, ank => ank.ID, st => st.O_ANK_ID, (ank, st) => st)
            .Where(x => stAr.Any(y => y == x.M_STATUS_ID) && 
                        x.STATUS_DATE >= dateS &&
                        x.STATUS_DATE <= datePo)
            .Count()
        ;
     }



     // получить постатейный расход по документам за период
     private IList<RasDokNameRashod> GetRasDokRashod(
         ATLANTEntities db, int m_org_id, DateTime dateS, DateTime datePo) 
     {
        return
          db.O_RAS_DOK.Where(x => x.M_ORG_ID == m_org_id &&
                                  x.D_SCHET >= dateS &&
                                  x.D_SCHET <= datePo &&
                                  x.M_RASHOD_STAT_ID != M_RASHOD_STAT_ID_INKAS)
                      .Join(db.M_RASHOD_STAT,
                            d => d.M_RASHOD_STAT_ID,
                            r => r.ID,
                            (d, r) => new {d.RASHOD, r.NAME})
                      .GroupBy(x => x.NAME)
                      .Select(x => new RasDokNameRashod {NAME = x.Key.ToString(),
                                        RASHOD = x.Sum(y => y.RASHOD) ?? 0}).ToList();
     }



    // получить информацию о показателях деятельности салона дилера D
    [HttpGet]
    public ActionResult GetDeyat(int M_ORG_ID, int year, int month) {

      using (ATLANTEntities db = new ATLANTEntities()) {

        // максимум бывает 5 недель, нахожу их границы
        // week 1 s
        DateTime? w1s = null;
        // week 1 po
        DateTime? w1po = null;
        DateTime? w2s = null;
        DateTime? w2po = null;
        DateTime? w3s = null;
        DateTime? w3po = null;
        DateTime? w4s = null;
        DateTime? w4po = null;
        DateTime? w5s = null;
        DateTime? w5po = null;
                
        DateTime dPeriodS;
        DateTime dPeriodPo;
        
        // получаю период календаря продаж
        GetKalenProdPeriod(M_ORG_ID, year, month, out dPeriodS, out dPeriodPo);

        // получаю рабочие дни
        List<M_WORK_DAY> workDays = db.M_WORK_DAY.Where(x => x.M_ORG_ID == M_ORG_ID).ToList();

        if (workDays.Count == 0) {
          return HttpNotFound("Не заполнен справочник рабочих дней !");
        }

        // границы недель
        getKPNextWeekBeginAndEnd(workDays, dPeriodS, dPeriodS, dPeriodPo, out w1s, out w1po);
        getKPNextWeekBeginAndEnd(workDays, w1po.Value.AddDays(1), dPeriodS, dPeriodPo, out w2s, out w2po);
        getKPNextWeekBeginAndEnd(workDays, w2po.Value.AddDays(1), dPeriodS, dPeriodPo, out w3s, out w3po);
        getKPNextWeekBeginAndEnd(workDays, w3po.Value.AddDays(1), dPeriodS, dPeriodPo, out w4s, out w4po);
        getKPNextWeekBeginAndEnd(workDays, w4po.Value.AddDays(1), dPeriodS, dPeriodPo, out w5s, out w5po);

        
        // точка безубыточности и валовый доход за весь период
        OtchetBuhDataViewModel model = GetOtchetBuhData(dPeriodS, dPeriodPo, 0, null);
        decimal tochkaBezub = model.TOCHKA_BEZUB;
        decimal valovDohod = model.VALOV_DOHOD;

        // количество продаж фактически
        int kolPrFaktVsego = GetSkladRasProductProdan(db, M_ORG_ID, dPeriodS, dPeriodPo).Sum(x => x.KOLVO) ?? 0;


        // количество продаж запланированно
        int kolPrZapl = GetProdajiPlanCount(db, M_ORG_ID, dPeriodS, dPeriodPo);


        // фактическое количество продаж по каждой неделе
        int kolPrFakt1w = 0;
        if (w1s.HasValue && w1po.HasValue) { 
          kolPrFakt1w = GetSkladRasProductProdan(db, M_ORG_ID, w1s.Value, w1po.Value).Sum(x => x.KOLVO) ?? 0;
        }
        //
        int kolPrFakt2w = 0;
        if (w2s.HasValue && w2po.HasValue) { 
          kolPrFakt2w = GetSkladRasProductProdan(db, M_ORG_ID, w2s.Value, w2po.Value).Sum(x => x.KOLVO) ?? 0;
        }
        //
        int kolPrFakt3w = 0;
        if (w3s.HasValue && w3po.HasValue) { 
          kolPrFakt3w = GetSkladRasProductProdan(db, M_ORG_ID, w3s.Value, w3po.Value).Sum(x => x.KOLVO) ?? 0;
        }
        //
        int kolPrFakt4w = 0;
        if (w4s.HasValue && w4po.HasValue) { 
          kolPrFakt4w = GetSkladRasProductProdan(db, M_ORG_ID, w4s.Value, w4po.Value).Sum(x => x.KOLVO) ?? 0;
        }
        //
        int kolPrFakt5w = 0;
        if (w5s.HasValue && w5po.HasValue) { 
          kolPrFakt5w = GetSkladRasProductProdan(db, M_ORG_ID, w5s.Value, w5po.Value).Sum(x => x.KOLVO) ?? 0;
        }


        // валовый доход по неделям
        decimal valovDohod1w = 0;
        if (w1s.HasValue && w1po.HasValue) { 
          valovDohod1w = GetOtchetBuhData(w1s, w1po, 0, null).VALOV_DOHOD;
        }
        //
        decimal valovDohod2w = 0;
        if (w2s.HasValue && w2po.HasValue) { 
          valovDohod2w = GetOtchetBuhData(w2s, w2po, 0, null).VALOV_DOHOD;
        }
        //
        decimal valovDohod3w = 0;
        if (w3s.HasValue && w3po.HasValue) { 
          valovDohod3w = GetOtchetBuhData(w3s, w3po, 0, null).VALOV_DOHOD;
        }
        //
        decimal valovDohod4w = 0;
        if (w4s.HasValue && w4po.HasValue) { 
          valovDohod4w = GetOtchetBuhData(w4s, w4po, 0, null).VALOV_DOHOD;
        }
        //
        decimal valovDohod5w = 0;
        if (w5s.HasValue && w5po.HasValue) { 
          valovDohod5w = GetOtchetBuhData(w5s, w5po, 0, null).VALOV_DOHOD;
        }



        var deyat = new {tochkaBezub = tochkaBezub, valovDohod = valovDohod,
                         kolPrFaktVsego = kolPrFaktVsego, kolPrZapl = kolPrZapl,
                         kolPrFakt1w, kolPrFakt2w, kolPrFakt3w, kolPrFakt4w, kolPrFakt5w,
                         valovDohod1w, valovDohod2w, valovDohod3w, valovDohod4w, valovDohod5w};  
        

        return Content(JsonConvert.SerializeObject(deyat), "application/json");

      }


    }






    // получить информацию о показателях Расходов салона дилера D
    [HttpGet]
    public ActionResult GetRashodi(int M_ORG_ID, int year, int month) {

      using (ATLANTEntities db = new ATLANTEntities()) {

        DateTime dPeriodS;
        DateTime dPeriodPo;
        
        // получаю период календаря продаж
        GetKalenProdPeriod(M_ORG_ID, year, month, out dPeriodS, out dPeriodPo);  

        var rashodi = GetRasDokRashod(db, M_ORG_ID, dPeriodS, dPeriodPo);

        return Content(JsonConvert.SerializeObject(rashodi), "application/json");

      }


    }




    // получить информацию о показателях Продажи салона дилера D
    [HttpGet]
    public ActionResult GetProdaji(int M_ORG_ID, int year, int month) {

      using (ATLANTEntities db = new ATLANTEntities()) {

        // максимум бывает 5 недель, нахожу их границы
        // week 1 s
        DateTime? w1s = null;
        // week 1 po
        DateTime? w1po = null;
        DateTime? w2s = null;
        DateTime? w2po = null;
        DateTime? w3s = null;
        DateTime? w3po = null;
        DateTime? w4s = null;
        DateTime? w4po = null;
        DateTime? w5s = null;
        DateTime? w5po = null;

        DateTime dPeriodS;
        DateTime dPeriodPo;
        
        // получаю период календаря продаж
        GetKalenProdPeriod(M_ORG_ID, year, month, out dPeriodS, out dPeriodPo);  


        // получаю рабочие дни
        List<M_WORK_DAY> workDays = db.M_WORK_DAY.Where(x => x.M_ORG_ID == M_ORG_ID).ToList();

        if (workDays.Count == 0) {
          return HttpNotFound("Не заполнен справочник рабочих дней !");
        }

        // границы недель
        getKPNextWeekBeginAndEnd(workDays, dPeriodS, dPeriodS, dPeriodPo, out w1s, out w1po);
        getKPNextWeekBeginAndEnd(workDays, w1po.Value.AddDays(1), dPeriodS, dPeriodPo, out w2s, out w2po);
        getKPNextWeekBeginAndEnd(workDays, w2po.Value.AddDays(1), dPeriodS, dPeriodPo, out w3s, out w3po);
        getKPNextWeekBeginAndEnd(workDays, w3po.Value.AddDays(1), dPeriodS, dPeriodPo, out w4s, out w4po);
        getKPNextWeekBeginAndEnd(workDays, w4po.Value.AddDays(1), dPeriodS, dPeriodPo, out w5s, out w5po);

        DateTime?[,] weeks = new DateTime?[5, 2];
        weeks[0, 0] = w1s; weeks[0, 1] = w1po;
        weeks[1, 0] = w2s; weeks[1, 1] = w2po;
        weeks[2, 0] = w3s; weeks[2, 1] = w3po;
        weeks[3, 0] = w4s; weeks[3, 1] = w4po;
        weeks[4, 0] = w5s; weeks[4, 1] = w5po;

        List<dynamic> prodaji = new List<dynamic>();



        // Наименование
        var row = new ExpandoObject() as IDictionary<string, Object>;
        row.Add("name", "Наименование");
        row.Add("sklad", "Склад");

        int j = 1;
        for(int i = 0; i <= 4; i += 1) {

          DateTime? d0 = weeks[i, 0];
          DateTime? d1 = weeks[i, 1];

          if (d0.HasValue && d1.HasValue) {

            for (DateTime date = weeks[i, 0].Value; date <= weeks[i, 1]; date = date.AddDays(1)) {

              switch ((int)date.DayOfWeek) {
                case 1:
                  row.Add("f" + j, "пн");
                  break;
                case 2:
                  row.Add("f" + j, "вт");
                  break;
                case 3:
                  row.Add("f" + j, "ср");
                  break;
                case 4:
                  row.Add("f" + j, "чт");
                  break;
                case 5:
                  row.Add("f" + j, "пт");
                  break;
                default:
                  break;
              }

              j += 1;

            }

            // неделя
            row.Add("f" + j, (i + 1) + " нед.");
            j += 1;

          } // if

        } // for

        row.Add("f" + j, "Колич.");
        j += 1;

        row.Add("f" + j, "Сумма");
        j += 1;

        prodaji.Add(row);

        // / наименование





        // Предоплаты
        row = new ExpandoObject() as IDictionary<string, Object>;
        row.Add("name", "Предоплаты");
        row.Add("sklad", "");

        int weekCnt = 0;
        int monthCnt = 0;
        j = 1;
        for(int i = 0; i <= 4; i += 1) {

          DateTime? d0 = weeks[i, 0];
          DateTime? d1 = weeks[i, 1];

          if (d0.HasValue && d1.HasValue) {

            for (DateTime date = weeks[i, 0].Value; date <= weeks[i, 1]; date = date.AddDays(1)) {

              // количество людей с предоплатой в этот день
              int pr = db.O_ANK.Where(x => x.M_ORG_ID == M_ORG_ID)
                         .Join(
                           db.O_STATUS
                             .Where(x => x.M_STATUS_ID == M_STATUS_ID_PREDOPL &&
                                             x.STATUS_DATE == date
                             ),
                           a => a.ID,
                           st => st.O_ANK_ID,
                           (a, st) => (a)
                         ).Count();
              row.Add("f" + j, pr);
              weekCnt = weekCnt + pr;
              monthCnt = monthCnt + pr;
              j += 1;

            }

            // неделя
            row.Add("f" + j, weekCnt);
            weekCnt = 0;
            j += 1;

          } // if

        } // for

        // количество
        row.Add("f" + j, monthCnt);
        monthCnt = 0;
        j += 1;

        // сумма
        row.Add("f" + j, "");
        j += 1;

        prodaji.Add(row);

        // / предоплаты





        // По всем строчкам оборудования

        // ищу все продукты, которые продавались за период
        IQueryable<M_PRODUCT> prod =
          GetSkladRasProductProdan(db, M_ORG_ID, dPeriodS, dPeriodPo)
          .Join(db.M_PRODUCT, p => p.M_PRODUCT_ID, m => m.ID, (p, m) => m)
          .Distinct()
        ;

        // остатки на складе
        var sklad = GetSkladData(M_ORG_ID);

        // по всем продуктам строю строки
        weekCnt = 0;
        monthCnt = 0;
        foreach(M_PRODUCT p in prod) {

          row = new ExpandoObject() as IDictionary<string, Object>;
          row.Add("name", p.NAME);
          var o = sklad.Where(x => x.ID == p.ID).FirstOrDefault();
          if (o != null) {
            row.Add("sklad", o.KOLVO);
          } else {
            row.Add("sklad", "");
          }

          j = 1;
          for(int i = 0; i <= 4; i += 1) {

            DateTime? d0 = weeks[i, 0];
            DateTime? d1 = weeks[i, 1];
            weekCnt = 0;

            if (d0.HasValue && d1.HasValue) {

              for (DateTime date = weeks[i, 0].Value; date <= weeks[i, 1]; date = date.AddDays(1)) {

                int prodan = GetSkladRasProductProdan(db, M_ORG_ID, date, date)
                                 .Where(x => x.M_PRODUCT_ID == p.ID).Sum(x => x.KOLVO) ?? 0;
                row.Add("f" + j, prodan);
                weekCnt += prodan;
                monthCnt += prodan;
                j += 1;

              }

              // неделя
              row.Add("f" + j, weekCnt);
              j += 1;
              weekCnt = 0;

            } // if

          } // for

          // количество
          row.Add("f" + j, monthCnt);
          monthCnt = 0;
          j += 1;

          // сумма
          var stoim = db.O_SKLAD_RAS_PRODUCT
                       .Where(x => x.M_ORG_ID == M_ORG_ID &&
                                   x.M_PRODUCT_ID == p.ID &&
                                   x.COST > 0 &&
                                   x.KOLVO > 0).FirstOrDefault();
          if (stoim != null) {
            row.Add("f" + j, Math.Round(stoim.COST.Value / stoim.KOLVO.Value, 2));
          } else {
            row.Add("f" + j, "");
          }
          j += 1;

          prodaji.Add(row);

        }
        // /по всем строчкам оборудования




        return Content(JsonConvert.SerializeObject(prodaji), "application/json");

      }


    }






    // возвращает посчитанную строку для таблицы Работа салона
    // в качестве lingFunc передаётся lambda-выражение, которое принимает
    // параметрами организацию M_ORG_ID и дату, на которую надо посчитать
    // значение ячейки, эта функция внутри метода будет вызвана многократно
    // для каждой ячейки
    // sumOrAvg - если 1, то для недели будет считаться сумма каждого из дней,
    //            если 2, то для недели будет считаться среднее арифметическое из дней
    private dynamic GetRabotaRow(Func<int, DateTime, double> linqFunc,
                                 int M_ORG_ID, DateTime dPeriodS, DateTime dPeriodPo,
                                 string rowCaption, int sumOrAvg, bool calcEmptyDays = true) {
      
      if (sumOrAvg != SumOrAvg_SUM && sumOrAvg != SumOrAvg_AVG) {
        throw new Exception("sumOrAvg должно быть 1 или 2");
      }
      
      // Строка Посещаемость 12/18
      double sum = 0;
      // сумма за месяц
      double sumMonth = 0;
      // количество рабочих дней в месяц
      int cntMonth = 0;
      var row = new ExpandoObject() as IDictionary<string, Object>;
      row.Add("name", rowCaption);
      
      // сумма по неделе sum week field
      int swf = 0;
      // количество слагаемых при расчёте среднего арифметического
      int cnt = 0;

      List<M_WORK_DAY> workDays;

      using (ATLANTEntities db = new ATLANTEntities()) {

        workDays = db.M_WORK_DAY.Where(x => x.M_ORG_ID == M_ORG_ID).ToList();

        bool predBilVih = false;
        sum = 0;
        cnt = 0;
        int i = 0;
        // итоги по неделе
        Action weekResults = delegate() {

          // данные за неделю
          // сумма
          swf += 1;
          if (sumOrAvg == SumOrAvg_SUM) {
            row.Add("swf" + swf, Math.Round(sum, 2));
          // среднее арифметическое
          } else if(sumOrAvg == SumOrAvg_AVG) {

			double newVal = 0;
			if (cnt > 0)
			{
				newVal = Math.Round(sum / cnt, 2);
			}

			row.Add("swf" + swf, newVal);
          }

          sum = 0;
          cnt = 0;

        };
        //
        for (DateTime date = dPeriodS; date <= dPeriodPo; date = date.AddDays(1)) {

          i += 1;

          // если это выходной день, значит неделя прошла
          int dayOfWeek = (int)(date.DayOfWeek);
          if (dayOfWeek == 0) {
            dayOfWeek = 7;
          }
          //
          if (
            !workDays.Any(x => x.DAY_ID == dayOfWeek)
          ) {

            // выходных подряд несколько, а неделя должна заканчиваться 1 раз
            if (!predBilVih) {

              weekResults();

            }

            predBilVih = true;

          // обычный рабочий день
          } else {
            
            row.Add("f" + i, 
              linqFunc(M_ORG_ID, date)
            );

			//исключаем дни в которые не было записей при условии что их нужно проускать
			if (calcEmptyDays || (double)row["f" + i] > 0)
			{
				cnt += 1;
				sum += (double)row["f" + i];
				sumMonth += (double)row["f" + i];
				cntMonth += 1;
			}
            
            predBilVih = false;

          }


          // если месяц заканчивается не выходным днём, а прямо в середине
          // недели, то тоже надо посчитать итоги за неделю
          if (date == dPeriodPo && workDays.Any(x => x.DAY_ID == dayOfWeek)) {
            weekResults();
          }

        } // for

      } // using

      

      //// месяц
      // сумма
      if (sumOrAvg == SumOrAvg_SUM) {
        row.Add("smf" + 1, Math.Round(sumMonth, 2));
      // среднее арифметическое
      } else if(sumOrAvg == SumOrAvg_AVG) {
		double newVal = 0;
		if (cntMonth > 0)
		{
			newVal = Math.Round(sumMonth / cntMonth, 2);
		}
		row.Add("smf" + 1, newVal);
      }
      

      return row;
      // /cтрока Посещаемость 12/18

    }

    /// <summary>
    /// Формирование отчета День
    /// </summary>
    /// <param name="M_ORG_ID">Идентификатор организации для формирования</param>
    /// <param name="dayOfFormation">Дата формирования</param>
    /// <returns></returns>
    [HttpGet]
    public ActionResult GetReportDay(int M_ORG_ID, DateTime dayOfFormation)
    {
      const int COUNT_MEST_FOR_CALCULATE_NAPOLN = 18;
      // избавляюсь от разницы +4 часа
      dayOfFormation = dayOfFormation.ToUniversalTime();

      using (ATLANTEntities db = new ATLANTEntities())
      {
        SqlParameter pDate = new SqlParameter("@seans_date", dayOfFormation);
        pDate.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter pMOrgId = new SqlParameter("@m_org_id", M_ORG_ID);
        pMOrgId.SqlDbType = SqlDbType.Int;

        List<ReportDayRow> reportRows = db.Database.SqlQuery<ReportDayRow>("EXEC [dbo].[GET_DAY_REPORT] @m_org_id = @m_org_id, @seans_date = @seans_date", pMOrgId, pDate).ToList();

        //Коллекция для хранения результатов
        //используем отсортированную коллекцию расчитывая, что данные расположены верно (по сеансам)
        //SortedDictionary<int,ReportDayRowViewModel> resultCollection = new SortedDictionary<int, ReportDayRowViewModel>();
        Dictionary<int, ReportDayRowViewModel> resultCollection = new Dictionary<int, ReportDayRowViewModel>();
        //идентификатор 1-го ряда
        int ryadID_first = 1;
        //идентификатор 2-го ряда
        int ryadID_second = 2;
        //полная разница со следующим днем
        int fullDifferentForTommorrow = 0;
        //полная разница с предыдущим днем
        int fullDifferentForYesterDay = 0;

        //просматриваем все пришедшие данные
        foreach (ReportDayRow item in reportRows)
        {   //если в результирующие коллекции еще нет сеанса с таким временм
          if (!resultCollection.ContainsKey(item.SEANS_TIME_ID))
          {
            resultCollection.Add(item.SEANS_TIME_ID, new ReportDayRowViewModel());
            resultCollection[item.SEANS_TIME_ID].Id = item.SEANS_TIME_ID;
            resultCollection[item.SEANS_TIME_ID].Name = item.SEANS_TIME_NAME;
          }
          resultCollection[item.SEANS_TIME_ID].CountAll += item.ALL_ANK;
          resultCollection[item.SEANS_TIME_ID].CountNew += item.All_NEW;
          resultCollection[item.SEANS_TIME_ID].CountOld += item.All_OLD;
          resultCollection[item.SEANS_TIME_ID].RecordForTommorrow += item.RECORD_FOR_TOMMORROW;
          if (item.RYAD_ID == ryadID_first)
          {
              resultCollection[item.SEANS_TIME_ID].FirstRyad += item.ALL_ANK;
          }
          if(item.RYAD_ID == ryadID_second)
          {
              resultCollection[item.SEANS_TIME_ID].SecondRyad += item.ALL_ANK;
          }
          fullDifferentForTommorrow += item.DIFERENT_FOR_TOMMORROW;
          fullDifferentForYesterDay += item.DIFERENT_FOR_YESTERDAY;

          resultCollection[item.SEANS_TIME_ID].DifferentForTommorrow += item.DIFERENT_FOR_TOMMORROW;
          resultCollection[item.SEANS_TIME_ID].DifferentForYesterday += item.DIFERENT_FOR_YESTERDAY;
        }


        SqlParameter pDate_2 = new SqlParameter("@seans_date", dayOfFormation);
        pDate.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter pMOrgId_2 = new SqlParameter("@m_org_id", M_ORG_ID);
        //получаем из базы численные параметры по посещениям за текущий день
        GetStatCountViewModel countStat = db.Database.SqlQuery<GetStatCountViewModel>("EXEC [dbo].GET_COUNT_STAT_POS_BY_DAY @m_org_id = @m_org_id, @seans_date = @seans_date", pDate_2, pMOrgId_2).First();

        ReportDayViewModel result = new ReportDayViewModel()
        {
          Data = resultCollection.Values.Select(x => new ReportDayRowShowViewModel
          {
            Id = x.Id,
            Name = x.Name,
            RecordForTommorrow = x.RecordForTommorrow,
            DifferentForYesterday = x.DifferentForYesterday,
            DifferentForTommorrow = x.DifferentForTommorrow,
            CountNew = x.CountNew,
            FirstRyad = x.FirstRyad,
            SecondRyad = x.SecondRyad,
            CountOld = x.CountOld,
            CountAll = x.CountAll,
            Napol = //взято из процедуры выше возмоно стоит переделать на расчет в запросе
                    ((((decimal)x.CountAll) / COUNT_MEST_FOR_CALCULATE_NAPOLN) * 100)
          }).ToList(),
          CountState = countStat,
          DifferentForTommorow = fullDifferentForTommorrow,
          DifferentForYesterday = fullDifferentForYesterDay
        };

        return Content(JsonConvert.SerializeObject(result), "application/json");
      }
    }

    /// <summary>
    /// Возвращает список записавшихся на сеанс за день
    /// </summary>
    /// <param name="M_ORG_ID">организация формирования</param>
    /// <param name="dayOfFormation">Дата формирования</param>
    /// <returns></returns>
    [HttpGet]
    public ActionResult GetListRecord(int M_ORG_ID, DateTime dayOfFormation)
    {

         // избавляюсь от разницы +4 часа
        dayOfFormation = dayOfFormation.ToUniversalTime();

        using (ATLANTEntities db = new ATLANTEntities())
        {
            SqlParameter pDate = new SqlParameter("@d", dayOfFormation);
            pDate.SqlDbType = SqlDbType.SmallDateTime;

            SqlParameter pMOrgId = new SqlParameter("@m_org_id", M_ORG_ID);
            pMOrgId.SqlDbType = SqlDbType.Int;

            var result = db.Database.SqlQuery<ShortAnkInfo>("EXEC [dbo].[GET_LIST_RECORD] @m_org_id = @m_org_id, @d = @d", pMOrgId, pDate).ToList();

            return Content(JsonConvert.SerializeObject(result), "application/json");
        }
    }

    /// <summary>
    /// Возвращает список пришедших на сеанс за день
    /// </summary>
    /// <param name="M_ORG_ID">организация формирования</param>
    /// <param name="dayOfFormation">Дата формирования</param>
    /// <returns></returns>
    [HttpGet]
    public ActionResult GetListCame(int M_ORG_ID, DateTime dayOfFormation)
    {

        // избавляюсь от разницы +4 часа
        dayOfFormation = dayOfFormation.ToUniversalTime();

        using (ATLANTEntities db = new ATLANTEntities())
        {
            SqlParameter pDate = new SqlParameter("@d", dayOfFormation);
            pDate.SqlDbType = SqlDbType.SmallDateTime;

            SqlParameter pMOrgId = new SqlParameter("@m_org_id", M_ORG_ID);
            pMOrgId.SqlDbType = SqlDbType.Int;

            var result = db.Database.SqlQuery<ShortAnkInfo>("EXEC [dbo].[GET_LIST_CAME] @m_org_id = @m_org_id, @d = @d", pMOrgId, pDate).ToList();

            return Content(JsonConvert.SerializeObject(result), "application/json");
        }
    }

    /// <summary>
    /// Возвращает список не пришедших на сеанс за день
    /// </summary>
    /// <param name="M_ORG_ID">организация формирования</param>
    /// <param name="dayOfFormation">Дата формирования</param>
    /// <returns></returns>
    [HttpGet]
    public ActionResult GetListNotCame(int M_ORG_ID, DateTime dayOfFormation)
    {

        // избавляюсь от разницы +4 часа
        dayOfFormation = dayOfFormation.ToUniversalTime();

        using (ATLANTEntities db = new ATLANTEntities())
        {
            SqlParameter pDate = new SqlParameter("@d", dayOfFormation);
            pDate.SqlDbType = SqlDbType.SmallDateTime;

            SqlParameter pMOrgId = new SqlParameter("@m_org_id", M_ORG_ID);
            pMOrgId.SqlDbType = SqlDbType.Int;

            var result = db.Database.SqlQuery<ShortAnkInfo>("EXEC [dbo].[GET_LIST_NOT_CAME] @m_org_id = @m_org_id, @d = @d", pMOrgId, pDate).ToList();

            return Content(JsonConvert.SerializeObject(result), "application/json");
        }
    }

    /// <summary>
    /// Возвращает список новеньких за день
    /// </summary>
    /// <param name="M_ORG_ID">организация формирования</param>
    /// <param name="dayOfFormation">Дата формирования</param>
    /// <returns></returns>
    [HttpGet]
    public ActionResult GetListNew(int M_ORG_ID, DateTime dayOfFormation)
    {

        // избавляюсь от разницы +4 часа
        dayOfFormation = dayOfFormation.ToUniversalTime();

        using (ATLANTEntities db = new ATLANTEntities())
        {
            SqlParameter pDate = new SqlParameter("@d", dayOfFormation);
            pDate.SqlDbType = SqlDbType.SmallDateTime;

            SqlParameter pMOrgId = new SqlParameter("@m_org_id", M_ORG_ID);
            pMOrgId.SqlDbType = SqlDbType.Int;

            var result = db.Database.SqlQuery<ShortAnkInfo>("EXEC [dbo].[GET_LIST_NEW] @m_org_id = @m_org_id, @d = @d", pMOrgId, pDate).ToList();

            return Content(JsonConvert.SerializeObject(result), "application/json");
        }
    }


    /// <summary>
    /// Возвращает список ушедших и не записавшихся
    /// </summary>
    /// <param name="M_ORG_ID">организация формирования</param>
    /// <param name="dayOfFormation">Дата формирования</param>
    /// <returns></returns>
    [HttpGet]
    public ActionResult GetListNotRecord(int M_ORG_ID, DateTime dayOfFormation)
    {

        // избавляюсь от разницы +4 часа
        dayOfFormation = dayOfFormation.ToUniversalTime();

        using (ATLANTEntities db = new ATLANTEntities())
        {
            SqlParameter pDate = new SqlParameter("@d", dayOfFormation);
            pDate.SqlDbType = SqlDbType.SmallDateTime;

            SqlParameter pMOrgId = new SqlParameter("@m_org_id", M_ORG_ID);
            pMOrgId.SqlDbType = SqlDbType.Int;

            var result = db.Database.SqlQuery<NotRecordViewModel>("EXEC [dbo].[GET_LIST_NOT_RECORD] @m_org_id = @m_org_id, @d = @d", pMOrgId, pDate).ToList();

            return Content(JsonConvert.SerializeObject(result), "application/json");
        }
    }


    /// <summary>
    /// Возвращает список не зарегистрировавшихся
    /// </summary>
    /// <param name="M_ORG_ID">организация формирования</param>
    /// <param name="dayOfFormation">Дата формирования</param>
    /// <returns></returns>
    [HttpGet]
    public ActionResult GetListNotReg(int M_ORG_ID, DateTime dayOfFormation)
    {

        // избавляюсь от разницы +4 часа
        dayOfFormation = dayOfFormation.ToUniversalTime();

        using (ATLANTEntities db = new ATLANTEntities())
        {
            SqlParameter pDate = new SqlParameter("@d", dayOfFormation);
            pDate.SqlDbType = SqlDbType.SmallDateTime;

            SqlParameter pMOrgId = new SqlParameter("@m_org_id", M_ORG_ID);
            pMOrgId.SqlDbType = SqlDbType.Int;

            var result = db.Database.SqlQuery<NotRegViewModel>("EXEC [dbo].[GET_LIST_NOT_REG] @m_org_id = @m_org_id, @d = @d", pMOrgId, pDate).ToList();

            return Content(JsonConvert.SerializeObject(result), "application/json");
        }
    }


    // получить период месяца календаря продаж для организации
    private O_KALEN_PROD GetKalenProdPeriod(int M_ORG_ID, int year, int month,
                                    out DateTime dPeriodS, out DateTime dPeriodPo) {

      using (ATLANTEntities db = new ATLANTEntities()) {
      
        // сначала надо найти дилера A для данной организации
        int dilerA = M_ORG_ID;
        while (db.M_ORG.Find(dilerA).M_ORG_TYPE_ID != M_ORG_TYPE_ID_DILER_A) {
          dilerA = db.M_ORG.Find(dilerA).PARENT_ID;
        }

        // нашли дилера A, теперь получаем период
        O_KALEN_PROD kp = db.O_KALEN_PROD.Where(x => x.M_ORG_ID == dilerA &&
                                                     x.GOD == year && x.MES == month).FirstOrDefault();

        if (kp == null) {
          throw new Exception("Не найден календарь продаж для организации " + M_ORG_ID + " за год " + year + " и месяц " + month );
        }

        dPeriodS = kp.D_PERIOD_S.Value;
        dPeriodPo = kp.D_PERIOD_PO.Value;

        return kp;

      }
      
    }



    // Посещаемость салона на указанную дату
    private Func<int, DateTime, double> dgGetPoseshCount = delegate(int m_org_id, DateTime dt) {

      using (ATLANTEntities db = new ATLANTEntities()) {

        return
          db.O_SEANS.Where(
            x => x.M_ORG_ID == m_org_id
              && DbFunctions.TruncateTime(x.D_REG) == dt.Date
          ).Count();

      }

    };



    // Наполняемость салона на указанную дату в процентах
    private Func<int, DateTime, double> dgGetNapolnProts = delegate(int m_org_id, DateTime dt) {

      using (ATLANTEntities db = new ATLANTEntities()) {

			//считаем количество сеансов которые были проведены
			int cuntSeanstInDay = db.O_SEANS.Where(
				y => y.M_ORG_ID == m_org_id
				&& DbFunctions.TruncateTime(y.D_REG) == dt.Date).Select(s => s.M_SEANS_TIME_ID).Distinct().Count();

			if (cuntSeanstInDay == 0)		//если этого не сделать результат будет NaN
			{
				return 0;
			}

			return
				  Math.Round((
					db.O_SEANS.Where(
					  y => y.M_ORG_ID == m_org_id
					  && DbFunctions.TruncateTime(y.D_REG) == dt.Date).Count()
					/
					(PLACE_COUNT * cuntSeanstInDay / 100f)
				  ), 2);

		}

    };


    // Наполняемость салона на указанную дату в абсолютном значении
    private Func<int, DateTime, double> dgGetNapoln = delegate(int m_org_id, DateTime dt) {

      using (ATLANTEntities db = new ATLANTEntities()) {

        return
              db.O_SEANS.Where(
                y => y.M_ORG_ID == m_org_id
                && DbFunctions.TruncateTime(y.D_REG) >= dt.Date).Count();

      }

    };


    // Количество новых посетителей на указанную дату
    private Func<int, DateTime, double> dgGetNovPosetCount = delegate(int m_org_id, DateTime dt) {

      using (ATLANTEntities db = new ATLANTEntities()) {

        return
            db.O_ANK.Where(
              x => x.M_ORG_ID == m_org_id
                && x.DATE_REG.Value.Year == dt.Year
                && x.DATE_REG.Value.Month == dt.Month
                && x.DATE_REG.Value.Day == dt.Day).Count();

      }

    };



    // Звонки салона на указанную дату
    private Func<int, DateTime, double> dgGetZvonkiCount = delegate(int m_org_id, DateTime dt) {

      using (ATLANTEntities db = new ATLANTEntities()) {

        return
            db.O_ZVONOK.Where(
               x => x.M_ORG_ID == m_org_id && DbFunctions.TruncateTime(x.D_START) == dt.Date).Count();

      }

    };


    // Количество сотрудников салона, выполнивших вход в систему на указанную дату
    private Func<int, DateTime, double> dgGetSotrudCount = delegate(int m_org_id, DateTime dt) {

      using (ATLANTEntities db = new ATLANTEntities()) {

        return
            db.S_USER.Where(
               x => x.M_ORG_ID == m_org_id)
               .Join(db.S_USER_SIGN_LOG, u => u.ID, l => l.S_USER_ID, (u, l) => l)
               .Where(x => DbFunctions.TruncateTime(x.D_SIGN) == dt)
               .Count();

      }

    };



    // Количество собранных контактов на указанную дату
    private Func<int, DateTime, double> dgGetKontCount = delegate(int m_org_id, DateTime dt) {

      using (ATLANTEntities db = new ATLANTEntities()) {

        return

          db.O_KONT_ANK.Where(
            x => x.M_ORG_ID == m_org_id &&
                 DbFunctions.TruncateTime(x.D_START) == dt).Count();

      }

    };






    // получить информацию о работе салона дилера D
    [HttpGet]
    public ActionResult GetRabota(int M_ORG_ID, int year, int month) {

      // календарь продаж не совпадает с календарным месяцем,
      // например календарь составленный на февраль может начинаться
      // с 5го февраля, получаю период с и по
      DateTime dPeriodS;
      DateTime dPeriodPo;
      O_KALEN_PROD kp = GetKalenProdPeriod(M_ORG_ID, year, month, out dPeriodS, out dPeriodPo);


      int j = 0;
      dynamic[] rabota = new dynamic[10];

      using (ATLANTEntities db = new ATLANTEntities()) {

        List<M_WORK_DAY> workDays = db.M_WORK_DAY.Where(x => x.M_ORG_ID == M_ORG_ID).ToList();


        // Строка Период
        var row = new ExpandoObject() as IDictionary<string, Object>;
        row.Add("name", "Период");

       
        // номер недели
        j = 1;
        int w = 1;
        // предыдущий день был выходным
        bool predBilVih = false;
        for (DateTime date = dPeriodS; date <= dPeriodPo; date = date.AddDays(1)) {

          // если это выходной день, значит неделя прошла
          int dayOfWeek = (int)(date.DayOfWeek);
          if (dayOfWeek == 0) {
            dayOfWeek = 7;
          }
          //
          if (!workDays.Any(x => x.DAY_ID == dayOfWeek)) {
            
            // выходных подряд несколько, а неделя должна заканчиваться 1 раз
            if (!predBilVih) {
              row.Add("f" + j, w + " нед. %");
              w += 1;
            }

            predBilVih = true;

          // рабочий день, просто добавляю
          } else {
            if (date >= kp.D_NAPOLN_S && date <= kp.D_NAPOLN_PO) {
              row.Add("f" + j, "н");
            } else if (date >= kp.D_VLYUB_S && date <= kp.D_VLYUB_PO) {
              row.Add("f" + j, "в");
            } else if (date >= kp.D_PROD_S && date <= kp.D_PROD_PO) {
              row.Add("f" + j, "п");
            } else {
              row.Add("f" + j, String.Empty);
            }
            
            predBilVih = false;
          }

          j += 1;

          // если месяц заканчивается не выходным днём, а прямо в середине
          // недели, то тоже надо посчитать итоги за неделю
          if (date == dPeriodPo && workDays.Any(x => x.DAY_ID == dayOfWeek)) {
            row.Add("f" + j, w + " нед. %");
            w += 1;
            j += 1;
          }


        }

        // месяц
        row.Add("f" + j, "месяц");

        rabota[0] = row;
        // /строка Период







        // Строка Дата (число)
        row = new ExpandoObject() as IDictionary<string, Object>;
        row.Add("name", "Дата (число)");

        j = 1;
        predBilVih = false;
        for (DateTime date = dPeriodS; date <= dPeriodPo; date = date.AddDays(1)) {





          // если это выходной день, значит неделя прошла
          int dayOfWeek = (int)(date.DayOfWeek);
          if (dayOfWeek == 0) {
            dayOfWeek = 7;
          }
          //
          if (!workDays.Any(x => x.DAY_ID == dayOfWeek)) {

           // выходных подряд несколько, а неделя должна заканчиваться 1 раз
            if (!predBilVih) {
              row.Add("f" + j, String.Empty);
            }

            predBilVih = true;

          } else {

            row.Add("f" + j, date.Day);
            predBilVih = false;

          }

          j += 1;

          // если месяц заканчивается не выходным днём, а прямо в середине
          // недели, то тоже надо посчитать итоги за неделю
          if (date == dPeriodPo && workDays.Any(x => x.DAY_ID == dayOfWeek)) {
            row.Add("f" + j, String.Empty);
            j += 1;
          }

        }

        // месяц
        row.Add("f" + j, String.Empty);

        rabota[1] = row;
        // /cтрока Дата (число)



        // Строка Записалось назавтра
        rabota[2] = GetRabotaRow(

          (m_org_id, dt) =>   
              db.O_SEANS.Where(
                x => x.M_ORG_ID == m_org_id
                && DbFunctions.TruncateTime(x.SEANS_DATE) == dt.Date
              ).Count(),

          M_ORG_ID, dPeriodS, dPeriodPo, "Записалось на завтра", SumOrAvg_AVG, false); //#364
        // /cтрока записалось назавтра



        // Строка Посещаемость 12/18
        rabota[3] = GetRabotaRow(

          dgGetPoseshCount,
		
		  M_ORG_ID, dPeriodS, dPeriodPo, "Посещаемость 12/18", SumOrAvg_AVG, false);
		// /cтрока Посещаемость 12/18


		// Строка Новые посетители
		rabota[4] = GetRabotaRow(

          dgGetNovPosetCount,

          M_ORG_ID, dPeriodS, dPeriodPo, "Новые посетители", SumOrAvg_SUM);
        // /cтрока Новые посетители



        // Строка Сбор контактов
        rabota[5] = GetRabotaRow(

            dgGetKontCount,

          M_ORG_ID, dPeriodS, dPeriodPo, "Сбор контактов", SumOrAvg_SUM);
        // /cтрока Сбор контактов



        // Строка Сотрудники
        rabota[6] = GetRabotaRow(

          dgGetSotrudCount,

          M_ORG_ID, dPeriodS, dPeriodPo, "Сотрудники", SumOrAvg_AVG);
        // /cтрока Сотрудники


        // Строка Презентаций в день
        rabota[7] = GetRabotaRow(

          (m_org_id, dt) => db.O_SEANS.Where(
            x => x.M_ORG_ID == m_org_id &&
                 DbFunctions.TruncateTime(x.D_REG) == dt
            ).Select(x => x.M_SEANS_TIME_ID).Distinct().Count(),

          M_ORG_ID, dPeriodS, dPeriodPo, "Презентаций в день", SumOrAvg_SUM);
        // /cтрока Презентаций в день



        // Строка Звонки
        rabota[8] = GetRabotaRow(

          dgGetZvonkiCount,

          M_ORG_ID, dPeriodS, dPeriodPo, "Звонки", SumOrAvg_SUM);
        // /cтрока Звонки



        // Строка Наполняемость салона, %
        rabota[9] = GetRabotaRow(

          dgGetNapolnProts,

		  M_ORG_ID, dPeriodS, dPeriodPo, "Наполняемость салона, %", SumOrAvg_AVG, false);
		// /cтрока Наполняемость салона, %

		return Content(JsonConvert.SerializeObject(rabota), "application/json");

      }

    }

    // получение списка прав текущего пользователя
    public ContentResult GetUserRightsViewEdit() {

      UserContext uc = GetUserContext();
      int S_USER_ID = uc.ID;

      using (ATLANTEntities db = new ATLANTEntities()) {
        var pr = 
            (
              from g in db.M_PRAVO_GR 
              from r in db.M_PRAVO_REJ.Where(u => u.M_PRAVO_GR_ID == g.ID).DefaultIfEmpty()
              from o in db.O_PRAVO_REJ.Where(u => u.M_PRAVO_REJ_ID == r.ID).DefaultIfEmpty()
              where (o.S_USER_ID == S_USER_ID)
              select new {
                GR_ID = r.M_PRAVO_GR_ID,
                GR_NAME = g.NAME,
                REJ_ID = o.M_PRAVO_REJ_ID,
                REJ_NAME = r.NAME,
                READ = o.READ1,
                WRITE = o.WRITE1
              }
            ).ToList();

        List<UserRights> pravaRej = new List<UserRights>();
        foreach (var e in pr) {
          UserRights u = new UserRights();
          u.GR_ID = e.GR_ID;
          u.GR_NAME = e.GR_NAME;
          u.REJ_ID = e.REJ_ID;
          u.REJ_NAME = e.REJ_NAME;
          u.READ = e.READ;
          u.WRITE = e.WRITE;

          // Issue #120 Дилер А может заходить только на просмотр в салоны
          // а в своей организации - делает что хочет
          if (uc.IS_DILER_A == 1 && uc.M_ORG_TYPE_ID != M_ORG_TYPE_ID_DILER_A) {
            u.WRITE = 0;
          }
          pravaRej.Add(u);
        }

        var pravaGr = db.O_PRAVO_GR.Where(x => x.S_USER_ID == uc.ID)
            .Join(db.M_PRAVO_GR, o => o.M_PRAVO_GR_ID, m => m.ID, (o, m) => new {m.ID, m.NAME, o.S_USER_ID})
            .ToList();
              
        return Content(JsonConvert.SerializeObject( new {pravaRej = pravaRej, pravaGr = pravaGr}), "application/json");
      }
    }

    // получение доступных для записи мест
    [HttpGet]
    public ContentResult GetRegSeansPlace(int M_RYAD_ID, int M_ORG_ID, int M_SEANS_TIME_ID) {

      using (ATLANTEntities db = new ATLANTEntities()) {

        // Получаю места и информацию о их занятости
        int m_seans_time_id = M_SEANS_TIME_ID;
        
        SqlParameter pM_seans_time_id = new SqlParameter("@m_seans_time_id", m_seans_time_id);
        pM_seans_time_id.SqlDbType = SqlDbType.Int;

        SqlParameter pM_ryad_id = new SqlParameter("@m_ryad_id", M_RYAD_ID);
        pM_ryad_id.SqlDbType = SqlDbType.Int;

        SqlParameter pM_org_id = new SqlParameter("@m_org_id", GetUserContext().M_ORG_ID);
        pM_org_id.SqlDbType = SqlDbType.Int;

        var r = db.Database.SqlQuery<RegSeansPlace>
          ("exec dbo.GET_REG_SEANS_PLACE @m_seans_time_id = @m_seans_time_id, @m_ryad_id = @m_ryad_id, @m_org_id = @m_org_id",
           pM_seans_time_id, pM_ryad_id, pM_org_id)
        .ToList<RegSeansPlace>();
        // /получаю места и информацию о их занятости


        return Content(JsonConvert.SerializeObject(r), "application/json");

      }
      

    }


    // проверить, что в данный момент открыта регистрация
    [HttpGet]
    public ContentResult GetCurrentRegStatus() {
      
      M_SEANS_TIME m_seans_time;
      if (IsRegOtk(out m_seans_time)) {
      
        using (ATLANTEntities db = new ATLANTEntities()) {
          
          // сколько уже зарегистрировалось на этот сеанс    
          UserContext uc = GetUserContext();
          DateTime now = CreateDate();
          int regCount = db.O_SEANS.Where(
                 x => x.M_ORG_ID == uc.M_ORG_ID &&
                 x.M_SEANS_TIME_ID == m_seans_time.ID &&
                 DbFunctions.TruncateTime(x.D_REG) == now.Date).Count()
          ;

          return Content(JsonConvert.SerializeObject(new {success = true, regCount = regCount}), "application/json"); 

        }

      } else {
        return Content(JsonConvert.SerializeObject(new {success = false, err = "Регистрация закрыта"}), "application/json"); 
      }

    }



    // true, если сейчас время, в которое открыта регистрация
    // заполняет m_seans_time значением времени сеанса текущей регистрации
    private bool IsRegOtk(out M_SEANS_TIME m_seans_time) {

      UserContext uc = GetUserContext();

      using (ATLANTEntities db = new ATLANTEntities()) {

        DateTime now = CreateDate().Date;
        DateTime nowTime = CreateDate();
        int nowMinutes = nowTime.Hour * 60 + nowTime.Minute;

        // ищу, на какое время сейчас открыта регистрация, 
        // регистрация считается открытой от начала сеанса + 10 минут
        var currMSeansTimeList = db.M_SEANS_TIME.Where(x =>
          x.M_ORG_ID == uc.M_ORG_ID &&
          x.MIN_TIME_MINUTES <= nowMinutes && 
          //(x.MIN_TIME_MINUTES + 10) > nowMinutes
          // TODO: временно увеличиваю этот интервал до 35 минут
          (x.MIN_TIME_MINUTES + 35) > nowMinutes
        );

        // TODO: из-за увеличения интервала по времени попадает больше
        // одного сеанса, беру самый близкий к текущей дате
        // потом это надо убрать
        currMSeansTimeList = currMSeansTimeList.OrderByDescending(x => x.MIN_TIME).Take(1);

        if (currMSeansTimeList.Count() != 1) {
          m_seans_time = null;
          return false;
        } else {
          m_seans_time = currMSeansTimeList.First();
          return true;
        }

      }

    }


    
    // выполнить регистрацию человека на сеанс
    [HttpGet]
    public ContentResult DoReg(int O_ANK_ID, int M_SEANS_TIME_ID, int M_RYAD_ID, int M_SEANS_PLACE_ID, int? IS_GOST) {
      
      UserContext uc = GetUserContext();
      DateTime now = CreateDate();

      // признак гостя
      if (IS_GOST == null) {
        IS_GOST = 0;
      }

      // признак того, что при регистрации была снята приостановка абонемента у клиента
      bool isPriostanovkaSnyata = false;
      // признак того, что у клиента есть задолженность по оплате абонемента
      bool isAbonZadol = false;
      // у клиента кончился абонемент
      bool isAbonKon = false;


      using (ATLANTEntities db = new ATLANTEntities()) {

        // проверяю, что человек на сегодня ещё не записан
        if (db.O_SEANS.Where(x =>
              x.O_ANK_ID == O_ANK_ID &&              
              DbFunctions.TruncateTime(x.D_REG) == now.Date).FirstOrDefault() != null)
        {
          return Content(JsonConvert.SerializeObject(new {success = false, err = "Регистрация данной анкеты на сегодня уже осуществлялась, повторная регистрация невозможна", code = 2, errCode = 2}), "application/json");
        }

        // проверяю, что место ещё не занято
        if (db.O_SEANS.Where(x =>
              x.M_ORG_ID == uc.M_ORG_ID &&
              x.M_SEANS_TIME_ID == M_SEANS_TIME_ID &&
              x.M_SEANS_PLACE_ID == M_SEANS_PLACE_ID &&
              DbFunctions.TruncateTime(x.D_REG) == now.Date).FirstOrDefault() != null)
        {

          // место занято, но если уже кончились все свободные места, то на это можно записать
          // если есть другие свободные места, то ошибка
          if (db.O_SEANS.Where(x => 
                x.M_ORG_ID == uc.M_ORG_ID &&
                x.M_SEANS_TIME_ID == M_SEANS_TIME_ID &&
                DbFunctions.TruncateTime(x.D_REG) == now.Date).Count() < 
              db.M_SEANS_PLACE.Where(x => x.M_ORG_ID == uc.M_ORG_ID).Count())
          {

            return Content(JsonConvert.SerializeObject(new {success = false, err = "Данное место уже занято, выберите другое", code = 1}), "application/json");

          }

        }
        

        // проверяю, что регистрация открыта
        M_SEANS_TIME currMSeansTime;
        currMSeansTime = db.M_SEANS_TIME.Find(M_SEANS_TIME_ID);
        if (currMSeansTime == null) {
          return Content(JsonConvert.SerializeObject(new {success = false, err = "Не найдено время сеанса", code = 1}), "application/json");
        }

        int currMSeansTimeId = currMSeansTime.ID;

        // если у человека на сегодня запись есть, но не на это время,
        // ставлю это время
        // то очищаю информацию о записи
        var currOSeansList = db.O_SEANS.Where(
          x => x.M_ORG_ID == uc.M_ORG_ID &&
          x.O_ANK_ID == O_ANK_ID &&
          DbFunctions.TruncateTime(x.D_REG) == now.Date &&
          x.M_SEANS_TIME_ID != currMSeansTimeId
        ).ToList();
        //
        foreach(var item in currOSeansList) {
          item.M_SEANS_TIME_ID = currMSeansTimeId;
        }

        // если у человека вообще нет записи на сегодня, то создаю O_SEANS
        var currSeans = db.O_SEANS.Where(x =>
              x.O_ANK_ID == O_ANK_ID &&
              x.M_ORG_ID == uc.M_ORG_ID &&
              DbFunctions.TruncateTime(x.SEANS_DATE) == now.Date).FirstOrDefault();

        // нет записи
        if (currSeans == null) {

          O_SEANS ss = new O_SEANS {
            D_REG = now,
            BEZ_REG = 0,
            D_START = now,
            M_ORG_ID = uc.M_ORG_ID,
            M_RYAD_ID = M_RYAD_ID,
            M_SEANS_PLACE_ID = M_SEANS_PLACE_ID,
            M_SEANS_TIME_ID = M_SEANS_TIME_ID,
            O_ANK_ID = O_ANK_ID,
            SEANS_DATE = null,
            SEANS_STATE = SEANS_STATE_SOSTOYALSYA,
            USERID = null,
            USERID_REG = uc.ID,
            LANE = 0,
            D_MODIF = now,
            IS_GOST = IS_GOST.Value
          };

          db.O_SEANS.Add(ss);

        // записан на сегодня
        } else {
          currSeans.LANE = 0;
          currSeans.M_RYAD_ID = M_RYAD_ID;
          currSeans.M_SEANS_PLACE_ID = M_SEANS_PLACE_ID;
          currSeans.SEANS_STATE = SEANS_STATE_SOSTOYALSYA;
          currSeans.USERID_REG = uc.ID;
          currSeans.D_REG = now;
          currSeans.BEZ_REG = 0;
          currSeans.M_SEANS_TIME_ID = M_SEANS_TIME_ID;
        }


        // если у человека есть абонемент, приостановленный на сегодняшную
        // дату, то снимаю приостановки (ставлю "дату по" на 1 день меньше текущей)
        DateTime today = now.Date;
        List<O_ABON_PRIOST> prList =
          db.O_ABON_PRIOST.Where(x => x.O_ANK_ID == O_ANK_ID)
            .Where(x => x.D_PRIOST_PO >= today && x.D_PRIOST_S <= today)
            .ToList();

        if (prList.Count > 0) {
          DateTime dt = today.AddDays(-1);
          foreach(O_ABON_PRIOST pr in prList) {
            // на сколько дней раньше закрылась приостановка
            int dnRanshe = (pr.D_PRIOST_PO.Value - dt).Days + 1;
            pr.D_PRIOST_PO = dt;
            isPriostanovkaSnyata = true;
            // и уменьшаю дату действия на столько дней, на сколько раньше закрылась приостановка
            O_SKLAD_RAS_PRODUCT prod = db.O_SKLAD_RAS_PRODUCT.Find(pr.O_SKLAD_RAS_PRODUCT_ID);
            prod.D_DEISTV = prod.D_DEISTV.Value.AddDays(-dnRanshe);
          }
        }



        // если у человека есть абонемент, по которому идёт задолженность по оплате
        SqlParameter pO_ANK_ID = new SqlParameter("o_ank_id", SqlDbType.Int);
        pO_ANK_ID.Value = O_ANK_ID;
        //
        SqlParameter pM_ORG_ID = new SqlParameter("m_org_id", SqlDbType.Int);
        pM_ORG_ID.Value = uc.M_ORG_ID;
        //
        int cnt = db.Database.SqlQuery<int>("select dbo.GET_IS_ABON_ZADOL(@o_ank_id, @m_org_id)", pO_ANK_ID, pM_ORG_ID).First();
        if (cnt > 0) {
          isAbonZadol = true;
        } else {
          isAbonZadol = false;
        }


        // абонемент просрочен
        if (execHAS_DEYSTV_ABON(O_ANK_ID)) {
          isAbonKon = false;
        } else {
          
          // действующиего абонемента нет, но надо проверить, есть ли вообще абонементы у клиента,
          // если нет и не было, то признак того, что кончился абонемент - не проставляю
          if (execHAS_ABON(O_ANK_ID)) {
            isAbonKon = true;
          } else {
            isAbonKon = false;
          }
        }


        // если у человека есть дата сокрытия из Учет - Отчеты - Не ходят
        // снимаем дату сокрытия
        var skr = db.O_ANK.Where(x => x.ID == O_ANK_ID && x.D_SKRYT_PO != null && x.D_SKRYT_PO > now).FirstOrDefault();
        if (skr != null) {
          skr.D_SKRYT_PO = null;
        }

        db.SaveChanges();
        
      } // using (db ..)

      return Content(JsonConvert.SerializeObject(new {success = true, isPriostanovkaSnyata = isPriostanovkaSnyata, isAbonZadol = isAbonZadol, isAbonKon = isAbonKon}), "application/json");

    }


    /// <summary>
    /// Выполняет добавление контакта
    /// </summary>
    /// <param name="surname">Фамилия</param>
    /// <param name="name">Имя</param>
    /// <param name="secname">Отчество</param>
    /// <param name="phone">Телефон</param>
    /// <param name="time_id">Идентификатор сеанса</param>
    /// <param name="date">Дата сеанса</param>
    /// <returns></returns>
    [HttpPost]
    public ActionResult CreateNewKont(string surname, string name, string secname, string phone, 
                                      int? time_id, DateTime? date, string commentForSave, int M_KONT_STATUS_ID, int M_KONT_IST_ID, int? SOZD_NEPR) {
      string message = "";
      DateTime dateExistKont = DateTime.MinValue;
      SOZD_NEPR = SOZD_NEPR ?? 0;

      //получаю нехватающую для сохранения информацию
      UserContext uc = GetUserContext();

      // избавляюсь от разницы +4 часа
      if (date.HasValue) {
        date = date.Value.ToUniversalTime();
      }

      using (ATLANTEntities db = new ATLANTEntities()) {


        // такой номер уже есть среди созданных анкет
        if (db.O_ANK.Any(k => k.M_ORG_ID == uc.M_ORG_ID && (k.PHONE_MOBILE == phone || k.PHONE_HOME == phone))) {
          message = "exists ank";
          return Json(new { success = message });
        }

        // нет такого номера в Контактах
        if (db.O_KONT_ANK.Where(k => k.PHONE == phone && k.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault() == null) {

          O_KONT_ANK newAnk = new O_KONT_ANK();
          newAnk.M_ORG_ID = uc.M_ORG_ID;
          newAnk.NAME = Capitalize(name);
          newAnk.PHONE = phone;
          newAnk.SECNAME = Capitalize(secname);
          newAnk.SURNAME = Capitalize(surname);
          newAnk.USERID = uc.ID;
          newAnk.D_START = CreateDate();
          newAnk.M_KONT_STATUS_ID = M_KONT_STATUS_ID;
          newAnk.M_KONT_IST_ID = M_KONT_IST_ID;
          newAnk.SOZD_NEPR = SOZD_NEPR.Value;
          
          db.O_KONT_ANK.Add(newAnk);
          db.SaveChanges();
          //не совсем уверен в правильности подхода, но другой идеи как получить ID нового объекта я не нашел


          O_KONT_SEANS seans = new O_KONT_SEANS();
          seans.M_ORG_ID = uc.M_ORG_ID;
          seans.O_KONT_ANK_ID = newAnk.ID;
          seans.USERID = uc.ID;
          seans.COMMENT = commentForSave;
          // для Не пришедших, создаваемых через интерфейс, дата и время сеанса не заполняются
          if (SOZD_NEPR == 1) {
            seans.M_SEANS_TIME_ID = null; 
            seans.SEANS_DATE = null;
          } else {
            seans.M_SEANS_TIME_ID = time_id.Value; 
            seans.SEANS_DATE = date.Value.Date;
          }
          db.O_KONT_SEANS.Add(seans);


          db.SaveChanges();
          message = "true";

            
          // сохранение комментария к сеансу
          if (!String.IsNullOrEmpty(commentForSave)) {
            O_KONT_SEANS_COMMENT c = O_KONT_SEANS_COMMENTNew(
              comment: commentForSave, userContext: uc, dbContext: db,
              O_KONT_SEANS_ID: seans.ID
            );
            db.O_KONT_SEANS_COMMENT.Add(c);
          }
          db.SaveChanges();
            

          // сохраняем действие
          O_DEISTV o = new O_DEISTV();
          o.M_DEISTV_ID = M_DEISTV_KONTAKT;
          o.MESS = uc.UserName + " Создал(а) новый контакт ФИО: " + (newAnk.SURNAME ?? "") + " " + (newAnk.NAME ?? "") + " " + (newAnk.SECNAME ?? "") +
                   " телефон " + (newAnk.PHONE ?? "") + ", запись на " + getDateddMMyyyyStr(seans.SEANS_DATE);
          SaveDeistv(o);

          // пишем действие в статистику контактов
          O_KONT_STATAdd(O_KONT_STAT_TIP_IZM.SOZDAN_KONT);


        } else {

          var existByPhone = db.O_KONT_ANK.First(k => k.PHONE == phone && k.M_ORG_ID == uc.M_ORG_ID);
          message = "exists";
          dateExistKont = existByPhone.D_START.Value;

        }
      }

      if (dateExistKont != DateTime.MinValue) {
        return Json(new { success = message, dateExist = dateExistKont.Date.ToString("dd.MM.yyyy") });
      } else {
        return Json(new { success = message });
      }

    }


    /// <summary>
    /// Выполняет изменение контакта
    /// </summary>
    /// <param name="surname">Фамилия</param>
    /// <param name="name">Имя</param>
    /// <param name="secname">Отчество</param>
    /// <param name="phone">Телефон</param>
    /// <param name="time_id">Идентификатор сеанса</param>
    /// <param name="date">Дата сеанса</param>
    /// <returns></returns>
    [HttpPost]
    public ActionResult ChangeKont(string surname, string name, string secname, string phone, string commentForSave, int? kontID, int M_KONT_STATUS_ID, int M_KONT_IST_ID)
    {
      string message = "";
      DateTime? dateExistKont = DateTime.MinValue;
      //получаю нехватающую для сохранения информацию
      var uc = GetUserContext();
      var userID = uc.ID;
      var mOrgID = uc.M_ORG_ID;
      DateTime now = CreateDate();

      using (ATLANTEntities db = new ATLANTEntities())
      {

        // такой номер уже есть среди созданных анкет
        if (db.O_ANK.Any(k => k.M_ORG_ID == mOrgID && (k.PHONE_MOBILE == phone || k.PHONE_HOME == phone))) {
          message = "exists ank";
          return Json(new { success = message });
        }


        // редактируемый контакт
        var editedKont = db.O_KONT_ANK.FirstOrDefault(k => k.ID == kontID.Value);

        // запоминаю некоторые поля исходного контакта, нужно для статистики ниже
        int unchangedKontM_KONT_STATUS_ID = editedKont.M_KONT_STATUS_ID;
        int unchangedKontM_KONT_IST_ID = editedKont.M_KONT_IST_ID;

        // сперва необходимо проверить не был ли задублирован номер
        // рассматриваем все варианты
        var existKontByPhone = db.O_KONT_ANK
                             .Where(k => k.PHONE == phone && k.M_ORG_ID == mOrgID && k.ID != kontID)
                             .ToList()
                             .FirstOrDefault();

        // такой номер уже есть, среди созданных контактов
        if (existKontByPhone != null) {

          message = "exists";
          var seans = db.O_KONT_SEANS.Where(x => x.O_KONT_ANK_ID == existKontByPhone.ID).ToList().FirstOrDefault();
          if(seans != null) {
            dateExistKont = seans.SEANS_DATE;
          }

          return Json(new { success = message,
                            dateExist = dateExistKont.HasValue ?
                                          dateExistKont.Value.Date.ToString("dd.MM.yyyy") :
                                          "неизвестная дата" });

        } else {

          // исходное значение комментария,  нужно для статистики ниже
          string unchangedSeansCOMMENT = null;

          // НИКИШКИН, 2017.07.27: это условие по идее всегда выполняется, потому что сюда мы
          //                       заходим, когда редактируем контакт, значит он уже есть, ну кроме
          //                       самых крайних случаев, когда с момента отображения на экране до
          //                       выполнения этой функции его успели удалить, сомневаюсь, что
          //                       именно это условие здесь проверяется
          if(editedKont != null) {
            if(editedKont.PHONE != phone) // если меняется номер
            { //сразу отвязываем анкету
              editedKont.O_ANK_ID = null;

              // пытаемся найти анкету с совпадающим номером
              // НИКИШКИН, 2017.07.27: тут непонятно, по идее сюда никогда не зайдёт, потому что выше есть
              //                       проверка, что нельзя вводить телефон, который уже есть в анкете
              var exist_O_ANK = db.O_ANK
                                  .FirstOrDefault(a => a.M_ORG_ID == mOrgID && 
                                                         (a.PHONE_HOME == phone || a.PHONE_MOBILE == phone));
              if (exist_O_ANK != null) //если анкета найдена
              { //проставляем ссылку
                editedKont.O_ANK_ID = exist_O_ANK.ID;
              } else { //если анкеты нет, убираем скрытие
                editedKont.SKR = 0;
              }
            }
            editedKont.SURNAME = surname;
            editedKont.NAME = name;
            editedKont.SECNAME = secname;
            editedKont.PHONE = phone;
            editedKont.M_KONT_STATUS_ID = M_KONT_STATUS_ID;
            editedKont.M_KONT_IST_ID = M_KONT_IST_ID;


            var editedSeans = db.O_KONT_SEANS.FirstOrDefault(s => s.O_KONT_ANK_ID == kontID.Value);

            // запомниаю исходное значение комментария, нужно для статистики ниже
            unchangedSeansCOMMENT = editedSeans.COMMENT;

            if(editedSeans != null) {
              if (!String.IsNullOrEmpty(commentForSave)) {
                O_KONT_SEANS_COMMENT c = O_KONT_SEANS_COMMENTNew(
                  comment: commentForSave, userContext: uc, dbContext: db,
                  O_KONT_SEANS_ID: editedSeans.ID
                );
                db.O_KONT_SEANS_COMMENT.Add(c);
              }
            }


          }

          db.SaveChanges();
          message = "true";

          #region статистика режима Контакты
          // если изменился комментарий, статус или источник, то считаю,
          // что был сделан звонок и пишу его в статистику контактов
          if(unchangedSeansCOMMENT != commentForSave ||
              unchangedKontM_KONT_STATUS_ID != M_KONT_STATUS_ID ||
              unchangedKontM_KONT_IST_ID != M_KONT_IST_ID)
          {
            O_KONT_STATAdd(O_KONT_STAT_TIP_IZM.ZVONOK);

            // если изменился комментарий, то делаю запись и об этом
            if (unchangedSeansCOMMENT != commentForSave) {
              O_KONT_STATAdd(O_KONT_STAT_TIP_IZM.DOBAV_COMMENT);
            }

            // если изменился статус, то делаю запись и об этом
            if (unchangedKontM_KONT_STATUS_ID != M_KONT_STATUS_ID) {
              O_KONT_STATAdd(O_KONT_STAT_TIP_IZM.IZM_STATUS, M_KONT_STATUS_ID);
            }

            // если изменился источник, то делаю запись и об этом
            if (unchangedKontM_KONT_IST_ID != M_KONT_IST_ID) {
              O_KONT_STATAdd(O_KONT_STAT_TIP_IZM.IZM_ISTOCH, null, M_KONT_IST_ID);
            }

          }
          #endregion


        }
      }

      return Json(new { success = message });
      
    }


    // создать новый объект типа O_KONT_SEANS_COMMENT (список комментариев)
    private O_KONT_SEANS_COMMENT O_KONT_SEANS_COMMENTNew(
        string comment, UserContext userContext, ATLANTEntities dbContext,
        int O_KONT_SEANS_ID
    )
    {

      DateTime now = CreateDate();

      return new O_KONT_SEANS_COMMENT() {
        ID = dbContext.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_KONT_SEANS_COMMENT_ID as int) ID").First(),
        D_START = now,
        D_MODIF = null,
        M_ORG_ID = userContext.M_ORG_ID,
        USERID = userContext.ID,
        O_KONT_SEANS_ID = O_KONT_SEANS_ID,
        COMMENT = comment
      };
    }


    /// <summary>
    /// Выполняет изменение контакта
    /// </summary>
    /// <param name="surname">Фамилия</param>
    /// <param name="name">Имя</param>
    /// <param name="secname">Отчество</param>
    /// <param name="phone">Телефон</param>
    /// <param name="time_id">Идентификатор сеанса</param>
    /// <param name="date">Дата сеанса</param>
    /// <returns></returns>
    [HttpPost]
    public ActionResult ChangeRecomendKont(string surname, string name, string secname, string phone, string commentForSave, int? kontID)
    {
      string message = "";
      //получаю нехватающую для сохранения информацию
      var userContext = GetUserContext();
      var userID = userContext.ID;
      var mOrgID = userContext.M_ORG_ID;

      using (ATLANTEntities db = new ATLANTEntities())
      {


        // такой номер уже есть среди созданных анкет
        if (db.O_ANK.Any(k => k.M_ORG_ID == mOrgID && (k.PHONE_MOBILE == phone || k.PHONE_HOME == phone))) {
          message = "exists ank";
          return Json(new { success = message });
        }


        var existKont = db.O_REK_ANK.FirstOrDefault(k => k.ID == kontID.Value);

        //Сперва необзодимо проверить не был ли задублирован номер
        //рассматриваем все варианты
        var existByPhone = db.O_REK_ANK.Where(k => k.PHONE == phone).ToList();
        if (existByPhone != null
        && (existByPhone.Count == 1
            && existByPhone.First() != existKont)
            ||
            existByPhone.Count > 1)
        {
          message = "exists";
        }
        else
        {
          if (existKont != null)
          {
            if (existKont.PHONE != phone) //если меняется номер
            { //сразу отвязываем анкету
              existKont.O_ANK_ID = null;

              //пытаемся найти анкету с совпадающим номером
              var exist_O_ANK = db.O_ANK.FirstOrDefault(a => a.PHONE_HOME == phone || a.PHONE_MOBILE == phone);
              if (exist_O_ANK != null) //если анкета найдена
              { //проставляем ссылку
                existKont.O_ANK_ID = exist_O_ANK.ID;
              }
              //else
              //{ //если анкеты нет, убираем скрытие
              //  existKont.SKR = 0;
              //}
            }
            existKont.SURNAME = surname;
            existKont.NAME = name;
            existKont.SECNAME = secname;
            existKont.PHONE = phone;
            //var existSeans = db.O_KONT_SEANS.FirstOrDefault(s => s.O_KONT_ANK_ID == kontID.Value);
            //if (existSeans != null)
            //{
            //  existSeans.COMMENT = commentForSave;
            //}
          }

          db.SaveChanges();
          message = "true";
        }
      }

      return Json(new { success = message });
    }

    /// <summary>
    /// Получает список контактов по переданной дате
    /// </summary>
    /// <param name="date"></param>
    ///  skrIzRecord - true, если надо скрыть из результатов Контакты,
    //                 которые скрыты из режима Запись, O_KONT_ANK.SKR_IZ_RECORD = 1
    /// <returns></returns>
    [HttpGet]
    public ActionResult GetKontacksByDay(DateTime? date, bool skrIzRecord) {
      
      // избавляюсь от разницы +4 часа
      if(date.HasValue) {
        date = date.Value.ToUniversalTime();
      }

      //получаем идентификатор организации (возможо стоит получает в качесте параметра процедуры)
      var m_org_id = GetUserContext().M_ORG_ID;
      DateTime usingDate = date.Value.Date;

      List<List<KontSeansAndAnkViewModel>> result = null;
      using(ATLANTEntities db = new ATLANTEntities()) {
        //получаем все данные за день
        var tempData =
            from seans in db.O_KONT_SEANS
            join ank in db.O_KONT_ANK on seans.O_KONT_ANK_ID equals ank.ID
            where
                 seans.M_ORG_ID == m_org_id 
              && seans.SEANS_DATE == usingDate
              && seans.M_SEANS_TIME_ID != null
              && ank.SKR == 0
            // те Контакты у которых статус "Срочно" должны появляться сверху, остальные ниже
            orderby (ank.M_KONT_STATUS_ID == M_KONT_STATUS_ID_SROCHNO ? 1 : 2)
            select new KontSeansAndAnkViewModel {
              KontSeansID = seans.ID,
              SeansTimeID = seans.M_SEANS_TIME_ID.Value,
              KontId = ank.ID,
              FIO = ank.SURNAME + " " + ank.NAME + " " + ank.SECNAME,
              Phone = ank.PHONE,
              Shown = true,
              SURNAME  = ank.SURNAME,
              NAME  = ank.NAME,
              SECNAME = ank.SECNAME,
              M_KONT_STATUS_ID = ank.M_KONT_STATUS_ID,
              M_KONT_IST_ID = ank.M_KONT_IST_ID,
              SKR_IZ_RECORD = ank.SKR_IZ_RECORD,
              // запоняю список комментариев к сеансу
              O_KONT_SEANS_COMMENTList =
                  db.O_KONT_SEANS_COMMENT.Where(y => y.O_KONT_SEANS_ID == seans.ID).OrderByDescending(y => y.ID).ToList()
            }
        ;

        // если надо, оставляю только Контакты, которые не скрыты из общего режима Запись
        if (skrIzRecord) {
          tempData = tempData.Where(x => x.SKR_IZ_RECORD == 0);
        }

        //подготвка даннных:
        //необходимо сформировать двумерный массив данных столбцы которого будут содержать контакты по сенсам
        //счетчик для определеня колечества результирующих строк (максималное число элементов)
        int maxCountForSeans = 0;

        var intermediateCollection = new Dictionary<int,List<KontSeansAndAnkViewModel>>();
        foreach(var kont in tempData.ToList()) {   //если еще небыло записанно этого сеанса добавляем
          if(intermediateCollection.ContainsKey(kont.SeansTimeID) == false) {
            intermediateCollection.Add(kont.SeansTimeID,new List<KontSeansAndAnkViewModel>());
          }

          //Добавляем контакт в соответсвующую коллекцию
          intermediateCollection[kont.SeansTimeID].Add(kont);

          //при необходимости корректируем счетчик результирующих строк
          if(intermediateCollection[kont.SeansTimeID].Count > maxCountForSeans) {
            maxCountForSeans = intermediateCollection[kont.SeansTimeID].Count;
          }
        }

        //специально отсортировал, чтобы реузльтат работы подходил для отображения
        var seansForUsing = db.M_SEANS_TIME.Where(s => s.M_ORG_ID == m_org_id).OrderBy(s => s.MIN_TIME).ToList();

        //результирующий массив данных 
        result = new List<List<KontSeansAndAnkViewModel>>();
        for(int rowIndex = 0;rowIndex < maxCountForSeans;rowIndex++) {
          result.Add(new List<KontSeansAndAnkViewModel>());
          for(int seansIndex = 0;seansIndex < seansForUsing.Count();seansIndex++) {
            result[rowIndex].Add(new KontSeansAndAnkViewModel() { Shown = false,SeansTimeID = seansForUsing.ElementAt(seansIndex).ID });
          }
        }


        for(int seansIndex = 0;seansIndex < seansForUsing.Count();seansIndex++) {
          var curSeans = seansForUsing.ElementAt(seansIndex);
          if(intermediateCollection.ContainsKey(curSeans.ID)) {
            for(int rowIndex = 0;rowIndex < intermediateCollection[curSeans.ID].Count;rowIndex++) {
              result[rowIndex][seansIndex] = intermediateCollection[curSeans.ID].ElementAt(rowIndex);
            }
          }
        }
      }
      return Content(JsonConvert.SerializeObject(result),"application/json");
    }

    /// <summary>
    /// Изменяет время и дату сеанса
    /// </summary>
    /// <param name="kontSeansID">Идентификатор изменяемой записи на сеанс</param>
    /// <param name="date">новая дата сеанса</param>
    /// <param name="seansTimeID">идентификатор нового времени сеанса</param>
    /// <param name="neprish"> = 1 - перенос сеанса из непришедших</param>
    /// <returns></returns>
    [HttpPost]
    public ActionResult ChangeKontSeans(int? kontSeansID, DateTime? date, int? time_id, string commentForSave, int? neprish) {

      // избавляюсь от разницы +4 часа
      if(date.HasValue) {
        date = date.Value.ToUniversalTime();
      }

      UserContext uc = GetUserContext();
      using(ATLANTEntities db = new ATLANTEntities()) {
        var changedItem = db.O_KONT_SEANS.Where(s => s.ID == kontSeansID.Value).First();

        // запоминаю исходные значения полей для добавления статистики ниже
        DateTime? unchangedSEANS_DATE = changedItem.SEANS_DATE;
        int? unchangedM_SEANS_TIME_ID = changedItem.M_SEANS_TIME_ID;
        string unchangedCOMMENT = changedItem.COMMENT;

        var kont = db.O_KONT_ANK.Find(changedItem.O_KONT_ANK_ID);
        


        // сохраняем действие
        O_DEISTV o = new O_DEISTV();
        if (kont == null) {
          return HttpNotFound($"Couldn't find dbo.O_KONT_ANK.ID = {changedItem.O_KONT_ANK_ID}");
        }
        //
        if (neprish.HasValue && neprish.Value == 0) {
          o.MESS = uc.UserName + " Перенес(ла) в режиме 'Контакты' " + (kont.SURNAME ?? "") + " " + (kont.NAME ?? "") + " " + (kont.SECNAME ?? "") +
                    " телефон " + (kont.PHONE ?? "") + " сеанс c " + getDateddMMyyyyStr(changedItem.SEANS_DATE) + " на " + getDateddMMyyyyStr(date);
        }
        //
        if (neprish.HasValue && neprish.Value == 1) {
          o.MESS = uc.UserName + " Перенес(ла) в режиме 'Контакты - Не пришедшие' " + (kont.SURNAME ?? "") + " " + (kont.NAME ?? "") + " " + (kont.SECNAME ?? "") +
                    " телефон " + (kont.PHONE ?? "") + " сеанс c " + getDateddMMyyyyStr(changedItem.SEANS_DATE) + " на " + getDateddMMyyyyStr(date);
        }
        //
        o.M_DEISTV_ID = M_DEISTV_KONTAKT;
        o.D_START = CreateDate();
        o.M_ORG_ID = uc.M_ORG_ID;
        o.USERID = uc.ID;
        db.O_DEISTV.Add(o);



        // снимаю признак Не пришедшего, созданного руками, после изменения даты сеанса
        // этот признак уже не интересен, нужно чтобы контакт ушёл из Не пришедших и стал обычным
        kont.SOZD_NEPR = 0;


        changedItem.SEANS_DATE = date.Value.Date;
        changedItem.M_SEANS_TIME_ID = time_id;
        changedItem.D_ZV = CreateDate();

        // сохранение комментария в список комментариев
        if (!String.IsNullOrEmpty(commentForSave)) {
          O_KONT_SEANS_COMMENT c = O_KONT_SEANS_COMMENTNew(
            comment: commentForSave, userContext: uc, dbContext: db,
            O_KONT_SEANS_ID: changedItem.ID
          );
          db.O_KONT_SEANS_COMMENT.Add(c);
        }

        db.SaveChanges();


        #region статистика режима контакты
        // если изменилась дата сеанса, время или комментарий, то сохраняю
        // статистику работы с контактом
        // если хоть что-то изменилось, то сохраняю звонок
        if (unchangedSEANS_DATE?.Date != date?.Date ||
            unchangedM_SEANS_TIME_ID != time_id ||
            unchangedCOMMENT != commentForSave)
        {
          O_KONT_STATAdd(O_KONT_STAT_TIP_IZM.ZVONOK);

          // если изменился комментарий, то сохраняю и его
          if (unchangedCOMMENT != commentForSave) {
            O_KONT_STATAdd(O_KONT_STAT_TIP_IZM.DOBAV_COMMENT);
          }
        }
        #endregion

      }


      return Json(new { success = "true" });
    }


    /// <summary>
    /// Возвращает список не пришедших на сегодняшнюю дату контактов
    ///   o_rek_ank_id_search - передаётся при поиске анкеты по Рекомендованным, приходит O_REK_ANK.ID человека,
    ///                         которого надо отобразить в результатах поиска, он должен быть в самом верху
    ///   nePrFilterM_KONT_STATUS_ID - фильтр по Не пришедшим, Статус контакта
    ///   nePrFilterM_KONT_IST_ID - фильтр по Не пришедшим, Источник контакта
    ///   D_ZVOrderBy - направление сортировки по полю Дата звонка для Не пришедших,
    ///                 0 - без сортировки, 1 - возрастание, 2 - убывание
    ///   o_kont_ank_id_search - ID контакта, который надо отобразить первым в списке, используется для поиска по Не пришедшим
    /// </summary>
    /// <returns></returns>
    [HttpGet]
    public ActionResult GetKontListByMode(int page, int mode, int o_rek_ank_id_search = 0, int? nePrFilterM_KONT_STATUS_ID = null, int? nePrFilterM_KONT_IST_ID = null, int nePrOrderByD_ZV = 0, int? o_kont_ank_id_search = 0) {
      DateTime curDate = CreateDate().Date;
      //int page = 2;
      int ROWS_PER_PAGE = 15;
      using(ATLANTEntities db = new ATLANTEntities()) {


        SqlParameter m_org_id = new SqlParameter("@m_org_id",GetUserContext().M_ORG_ID);
        m_org_id.SqlDbType = SqlDbType.Int;

        SqlParameter param_page = new SqlParameter("@page",page);
        param_page.SqlDbType = SqlDbType.Int;

        SqlParameter param_rows_per_page = new SqlParameter("@rows_per_page",ROWS_PER_PAGE);
        param_rows_per_page.SqlDbType = SqlDbType.Int;

        SqlParameter param_mode = new SqlParameter("@mode", mode);
        param_rows_per_page.SqlDbType = SqlDbType.Int;

        SqlParameter param_o_rek_ank_id_search = new SqlParameter("@o_rek_ank_id_search", o_rek_ank_id_search);
        param_o_rek_ank_id_search.SqlDbType = SqlDbType.Int;

        SqlParameter param_nePrFilterM_KONT_STATUS_ID = new SqlParameter("@nePrFilterM_KONT_STATUS_ID", SqlDbType.Int);
        param_nePrFilterM_KONT_STATUS_ID.Value = DBNullOrValue(nePrFilterM_KONT_STATUS_ID);

        SqlParameter param_nePrFilterM_KONT_IST_ID = new SqlParameter("@nePrFilterM_KONT_IST_ID", SqlDbType.Int);
        param_nePrFilterM_KONT_IST_ID.Value = DBNullOrValue(nePrFilterM_KONT_IST_ID);

        SqlParameter param_nePrOrderByD_ZV = new SqlParameter("@nePrOrderByD_ZV", SqlDbType.Int);
        param_nePrOrderByD_ZV.Value = nePrOrderByD_ZV;

        SqlParameter param_o_kont_ank_id_search = new SqlParameter("o_kont_ank_id_search", SqlDbType.Int);
        param_o_kont_ank_id_search.Value = o_kont_ank_id_search;

        var r = db.Database.SqlQuery<KontNotCameViewModel>("exec dbo.GET_KONT_LIST_BY_MODE @m_org_id = @m_org_id, @page = @page, @rows_per_page = @rows_per_page, @mode = @mode, @o_kont_ank_id_search = @o_kont_ank_id_search, @o_rek_ank_id_search = @o_rek_ank_id_search, @nePrFilterM_KONT_STATUS_ID = @nePrFilterM_KONT_STATUS_ID, @nePrFilterM_KONT_IST_ID = @nePrFilterM_KONT_IST_ID, @nePrOrderByD_ZV = @nePrOrderByD_ZV", m_org_id,param_page,param_rows_per_page, param_mode, param_o_kont_ank_id_search, param_o_rek_ank_id_search, param_nePrFilterM_KONT_STATUS_ID, param_nePrFilterM_KONT_IST_ID, param_nePrOrderByD_ZV).ToList();
        int count_all = 0;
        int totalPageCount = 0;
        if(r.Count != 0) {
          count_all = r.First().COUNT_ALL;
          totalPageCount = count_all / ROWS_PER_PAGE;
          if(count_all % ROWS_PER_PAGE != 0) {
            totalPageCount += 1;
          }

          // запоняю список комментариев к сеансу
          r.ForEach(x => x.O_KONT_SEANS_COMMENTList = db.O_KONT_SEANS_COMMENT.Where(y => y.O_KONT_SEANS_ID == x.KONT_SEANS_ID).OrderByDescending(y => y.ID).ToList());
        }

        return Content(JsonConvert.SerializeObject(new {
          rows = r, totalPageCount = totalPageCount, countAll = count_all
        }),"application/json");
      }
    }

    /// <summary>
    /// Удаляет контакт
    /// </summary>
    /// <param name="kont"></param>
    /// <returns></returns>
    [HttpPost]
    public JsonResult RemoveKont(KontNotCameViewModel kont) {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        var removedKont = db.O_KONT_ANK.FirstOrDefault(k => k.ID == kont.KONT_ID);
        //раньше удаляли, теперь делаем скрытыми
        removedKont.SKR = 1;

        // очищаю статус контакта, чтобы если он был "Срочный", то не было
        // эффекта моргающей рамки вокруг его фамилии на вкладке Скрытые
        removedKont.M_KONT_STATUS_ID = M_KONT_STATUS_ID_VIBERITE_STATUS;

        // сохраняем действие
        O_DEISTV o = new O_DEISTV();
        var e = db.O_KONT_ANK.Find(removedKont.ID);
        if (e != null) {
          o.MESS = uc.UserName + " Перенес(ла) в режим 'Контакты - Скрытые' " + (e.SURNAME ?? "") + " " + (e.NAME ?? "") + " " + (e.SECNAME ?? "") +
                     " телефон " + (e.PHONE ?? "");

          o.M_DEISTV_ID = M_DEISTV_KONTAKT;
          o.D_START = CreateDate();
          o.M_ORG_ID = uc.M_ORG_ID;
          o.USERID = uc.ID;
          db.O_DEISTV.Add(o);
        }

        db.SaveChanges();
      }

      return Json(new { success = "true" });
    }


    // убрать Контакт из общего режима Записи, но оставить в режиме
    // Контакты - Запись
    // O_KONT_ANK_ID - идентификатор контакта dbo.O_KONT_ANK.ID
    public ActionResult RemoveKontFromRecord(int O_KONT_ANK_ID) {

      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {

        O_KONT_ANK k = db.O_KONT_ANK.Find(O_KONT_ANK_ID);
        if (k == null) {
          return HttpNotFound("Couldn't find O_KONT_ANK with ID = " + O_KONT_ANK_ID);
        }

        k.SKR_IZ_RECORD = 1;

        db.SaveChanges();

        // пишем действие в статистику контактов
        O_KONT_STATAdd(O_KONT_STAT_TIP_IZM.ZVONOK);

        return Content(JsonConvert.SerializeObject(new {success = true}), "application/json");

      }

    }


    /// <summary>
    /// Востанавливает контакт
    /// </summary>
    /// <param name="kont"></param>
    /// <returns></returns>
    [HttpPost]
    public JsonResult UndoKont(KontNotCameViewModel kont) {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        var removedKont = db.O_KONT_ANK.FirstOrDefault(k => k.ID == kont.KONT_ID);
        
        //раньше удаляли, теперь делаем скрытыми
        removedKont.SKR = 0;

        // сохраняем действие
        O_DEISTV o = new O_DEISTV();
        var e = db.O_KONT_ANK.Find(removedKont.ID);
        if (e != null) {
          o.MESS = uc.UserName + " Вернул(а) из режима 'Контакты - Скрытые' " + (e.SURNAME ?? "") + " " + (e.NAME ?? "") + " " + (e.SECNAME ?? "") +
                     " телефон " + (e.PHONE ?? "");

          o.M_DEISTV_ID = M_DEISTV_KONTAKT;
          o.D_START = CreateDate();
          o.M_ORG_ID = uc.M_ORG_ID;
          o.USERID = uc.ID;
          db.O_DEISTV.Add(o);
        }

        db.SaveChanges();
      }
      return Json(new { success = "true" });
    }

    // удаляем запись из режима "Запись", если сеанс не состоялся (seans_state = 0)
    [HttpPost]
    public JsonResult RemoveSeans(int ID) {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        var r = db.O_SEANS.Find(ID);
        if(r != null) {

          // сохраняем действие
          O_DEISTV o = new O_DEISTV();
          var e = db.O_ANK.Find(r.O_ANK_ID);
          if (e != null) {
            o.MESS = uc.UserName + " Удалил(а) в режиме 'Запись' " + (e.SURNAME ?? "") + " " + (e.NAME ?? "") + " " + (e.SECNAME ?? "") +
                     " сеанс " + getDateddMMyyyyStr(r.SEANS_DATE);
            o.O_ANK_ID = r.O_ANK_ID;
            o.M_DEISTV_ID = M_DEISTV_SEANS;
            o.D_START = CreateDate();
            o.M_ORG_ID = uc.M_ORG_ID;
            o.USERID = uc.ID;
            db.O_DEISTV.Add(o);
          }

          db.O_SEANS.Remove(r);
          db.SaveChanges();
        }
      }
      return Json(new {
        success = "true"
      });
    }


    /// <summary>
    /// Получает данные для отчета Статистика
    /// </summary>
    /// <param name="fromDate">Начало исследуемого периода</param>
    /// <param name="toDate">Окончание исследуамого периода</param>
    /// <returns></returns>
    [HttpGet]
    public ActionResult GetReportStatistic(DateTime? fromDate,DateTime? toDate) {
      // избавляюсь от разницы +4 часа
      fromDate = fromDate.Value.ToUniversalTime();
      toDate = toDate.Value.ToUniversalTime();

      using(ATLANTEntities db = new ATLANTEntities()) {
        SqlParameter p_fromDate = new SqlParameter("@fromDate",fromDate);
        p_fromDate.SqlDbType = SqlDbType.SmallDateTime;


        SqlParameter p_toDate = new SqlParameter("@toDate",toDate);
        p_toDate.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter p_MOrgId = new SqlParameter("@m_org_id",GetUserContext().M_ORG_ID);
        p_MOrgId.SqlDbType = SqlDbType.Int;

        ReportStatisticViewModel report = db.Database.SqlQuery<ReportStatisticViewModel>("EXEC [dbo].[GET_REPORT_STATISTIC] @fromDate = @fromDate, @toDate = @toDate, @m_org_id = @m_org_id",p_fromDate,p_toDate,p_MOrgId).FirstOrDefault();

        return Content(JsonConvert.SerializeObject(report),"application/json");
      }
    }


    /// <summary>
    /// Отчет Специалисты
    /// </summary>
    /// <param name="fromDate"></param>
    /// <param name="toDate"></param>
    /// <returns></returns>
    [HttpGet]
    public ActionResult GetReportSpecailists(DateTime? fromDate, DateTime? toDate)
    {
      // избавляюсь от разницы +4 часа
      fromDate = fromDate.Value.ToUniversalTime();
      toDate = toDate.Value.ToUniversalTime();

      using (ATLANTEntities db = new ATLANTEntities())
      {
        SqlParameter p_fromDate = new SqlParameter("@fromDate", fromDate);
        p_fromDate.SqlDbType = SqlDbType.SmallDateTime;


        SqlParameter p_toDate = new SqlParameter("@toDate", toDate);
        p_toDate.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter p_MOrgId = new SqlParameter("@m_org_id", GetUserContext().M_ORG_ID);
        p_MOrgId.SqlDbType = SqlDbType.Int;

        List<RowReportSpecialistViewModel> report = db.Database.SqlQuery<RowReportSpecialistViewModel>("EXEC [dbo].[GET_RETPORT_SPECIALISTS] @fromDate = @fromDate, @toDate = @toDate, @m_org_id = @m_org_id", p_fromDate, p_toDate, p_MOrgId).ToList();

        return Content(JsonConvert.SerializeObject(report), "application/json");
      }
    }

    /// <summary>
    /// Отчет Заболевания
    /// </summary>
    /// <param name="fromDate"></param>
    /// <param name="toDate"></param>
    /// <returns></returns>
    [HttpGet]
    public ActionResult GetReportZabol(DateTime? fromDate, DateTime? toDate)
    {
      // избавляюсь от разницы +4 часа
      fromDate = fromDate.Value.ToUniversalTime();
      toDate = toDate.Value.ToUniversalTime();

      using (ATLANTEntities db = new ATLANTEntities())
      {
        SqlParameter p_fromDate = new SqlParameter("@fromDate", fromDate);
        p_fromDate.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter p_toDate = new SqlParameter("@toDate", toDate);
        p_toDate.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter p_MOrgId = new SqlParameter("@m_org_id", GetUserContext().M_ORG_ID);
        p_MOrgId.SqlDbType = SqlDbType.Int;

        List<RowReportZabolViewModel> report = db.Database.SqlQuery<RowReportZabolViewModel>("EXEC [dbo].[GET_REPORT_ZABOL] @fromDate = @fromDate, @toDate = @toDate, @m_org_id = @m_org_id", p_fromDate, p_toDate, p_MOrgId).ToList();

        return Content(JsonConvert.SerializeObject(report), "application/json");
      }
    }

    /// <summary>
    /// Отчет Источники
    /// </summary>
    /// <param name="fromDate"></param>
    /// <param name="toDate"></param>
    /// <returns></returns>
    [HttpGet]
    public ActionResult GetReportIst(DateTime? fromDate, DateTime? toDate)
    {
      // избавляюсь от разницы +4 часа
      fromDate = fromDate.Value.ToUniversalTime();
      toDate = toDate.Value.ToUniversalTime();

      using (ATLANTEntities db = new ATLANTEntities())
      {
        SqlParameter p_fromDate = new SqlParameter("@fromDate", fromDate);
        p_fromDate.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter p_toDate = new SqlParameter("@toDate", toDate);
        p_toDate.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter p_MOrgId = new SqlParameter("@m_org_id", GetUserContext().M_ORG_ID);
        p_MOrgId.SqlDbType = SqlDbType.Int;

        List<RowReportInstViewModel> report = db.Database.SqlQuery<RowReportInstViewModel>("EXEC [dbo].[GET_REPORT_IST] @fromDate = @fromDate, @toDate = @toDate, @m_org_id = @m_org_id", p_fromDate, p_toDate, p_MOrgId).ToList();

        return Content(JsonConvert.SerializeObject(report), "application/json");
      }
    }

    /// <summary>
    /// Отчет Дни рождения
    /// </summary>
    /// <param name="fromDate"></param>
    /// <param name="toDate"></param>
    /// <returns></returns>
    [HttpGet]
    public ActionResult GetReportBirthday(DateTime? fromDate, DateTime? toDate)
    {
      // избавляюсь от разницы +4 часа
      fromDate = fromDate.Value.ToUniversalTime();
      toDate = toDate.Value.ToUniversalTime();

      using (ATLANTEntities db = new ATLANTEntities())
      {
        SqlParameter p_fromDate = new SqlParameter("@fromDate", fromDate);
        p_fromDate.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter p_toDate = new SqlParameter("@toDate", toDate);
        p_toDate.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter p_MOrgId = new SqlParameter("@m_org_id", GetUserContext().M_ORG_ID);
        p_MOrgId.SqlDbType = SqlDbType.Int;

        List<RowReportBirthday> report = db.Database.SqlQuery<RowReportBirthday>("EXEC [dbo].[GET_REPORT_BIRTHDAY] @fromDate = @fromDate, @toDate = @toDate, @m_org_id = @m_org_id", p_fromDate, p_toDate, p_MOrgId).ToList();

        return Content(JsonConvert.SerializeObject(report), "application/json");
      }
    }

    /// <summary>
    /// Помечает звонок о дне рождении состоявшимся
    /// </summary>
    /// <param name="kont"></param>
    /// <returns></returns>
    [HttpPost]
    public JsonResult MarkAnkCallBirthday(int ank_id)
    {
      using (ATLANTEntities db = new ATLANTEntities())
      {
        var userContext = GetUserContext();  
        O_REPORT_BIRTHDAY_CALL newCall = new O_REPORT_BIRTHDAY_CALL();
        newCall.O_ANK_ID = ank_id;

        newCall.USERID = userContext.ID;
        newCall.M_ORG_ID = userContext.M_ORG_ID;
        newCall.D_START = CreateDate();
        db.O_REPORT_BIRTHDAY_CALL.Add(newCall);
        db.SaveChanges();
      }
      return Json(new
      {
        success = "true"
      });
    }

    // получить текущую дату и время с нулевым часовым поясом
    public DateTime CreateDate() {

      DateTime now = DateTime.Now;
      now = now.ToUniversalTime();
      UserContext uc = GetUserContext();

      using(ATLANTEntities db = new ATLANTEntities()) {
        var org = db.M_ORG.Find(uc.M_ORG_ID);

        if(org == null) {
          throw new Exception("Не удалось найти организацию M_ORG_ID = " + uc.M_ORG_ID);
        }

        var tz = org.TZ;

        if(!tz.HasValue) {
          throw new Exception("Для организации M_ORG_ID = " + uc.M_ORG_ID + " не задан часовой пояс");
        }

        now = now.AddHours(tz.Value);

        return now;

      }
    }

    // возвращает серверное время
    [HttpGet]
    public ActionResult GetCurrentDateTime() {

      DateTime now = CreateDate();
      now = DateTime.SpecifyKind(now, DateTimeKind.Unspecified);
      
      return Content(JsonConvert.SerializeObject(new {currentDateTime = now}), "application/json");
      
    }


    // сделать заглавной первую букву слова
    public string Capitalize(string s) {
      
      if (String.IsNullOrEmpty(s)) {
        return null;
      } else {
        return s.First().ToString().ToUpper() + s.Substring(1);
      }
    }

    // получить дату в формате dd.mm.yyyy, чтобы не зависеть от региональных настроек
    public string getDateddMMyyyyStr(DateTime? d) {
      string result = "";
      if (d.HasValue) {
        var a = d.Value.Day;
        var b = d.Value.Month;

        if (a < 10) result += string.Format("0{0}", a);
        else result += string.Format("{0}", a);

        if (b < 10) result += string.Format(".0{0}", b);
        else result += string.Format(".{0}", b);

        result += string.Format(".{0}", d.Value.Year);
      }
      return result;
    }

    // получить время в формате HH:mm, чтобы не зависеть от региональных настроек
    public string getTimehhMMStr(DateTime? d) {
      string result = "";
      if (d.HasValue) {
        var h = d.Value.Hour;
        var m = d.Value.Minute;

        if (h < 10) result += string.Format("0{0}", h);
        else result += string.Format("{0}", h);

        if (m < 10) result += string.Format(".0{0}", m);
        else result += string.Format(".{0}", m);
      }
      return result;
    }



    // поменять организацию текущему пользователю (открыть магазин другой организации)
    // NEW_M_ORG_ID - идентификатор новой организации
    [HttpPost]
    public ActionResult CurrentUserChangeM_ORG_ID(int NEW_M_ORG_ID) {

      UserContext uc = GetUserContext();

      using(ATLANTEntities db = new ATLANTEntities()) {

        S_USER user = db.S_USER.Find(uc.ID);

        if (user == null) {
          return HttpNotFound("Пользователь не найден: ID = " + uc.ID);
        }

        user.M_ORG_ID = NEW_M_ORG_ID;

        db.SaveChanges();

      }

      return Content(JsonConvert.SerializeObject(new { success = true, userId = uc.ID }), "application/json");

    }



    // сохранить Учёт - Приход на склад
    [HttpPost]
    public ActionResult UchetSkladPrSave(O_SKLAD_PR o_sklad_pr, IList<O_SKLAD_PR_PRODUCT> o_sklad_pr_product) {

      // если нет сохраняемых товаров, то создаю объет для избежания ошибок
      if (o_sklad_pr_product == null) {
        o_sklad_pr_product = new List<O_SKLAD_PR_PRODUCT>();
      }

      UserContext uc = GetUserContext();
      DateTime now = CreateDate();

      using(ATLANTEntities db = new ATLANTEntities()) {


        // редактирование прихода
        if (o_sklad_pr.ID != 0) {

          O_SKLAD_PR db_o_sklad_pr = db.O_SKLAD_PR.AsNoTracking().Where(x => x.ID == o_sklad_pr.ID).FirstOrDefault();

          if (db_o_sklad_pr == null) {
            return HttpNotFound("Приход не найден: ID = " + db_o_sklad_pr.ID);
          }

          db.O_SKLAD_PR.Remove(db.O_SKLAD_PR.Find(db_o_sklad_pr.ID));

          // обновляю пришедшими значениями
          db_o_sklad_pr.D_MODIF = now;
          db_o_sklad_pr.D_SCHET = o_sklad_pr.D_SCHET;
          db_o_sklad_pr.N_SCHET = o_sklad_pr.N_SCHET;

          o_sklad_pr = db_o_sklad_pr;

        // новый приход
        } else {

          DbRawSqlQuery<int> newIdList = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_SKLAD_PR_ID as int);");
          int newId = newIdList.First();

          o_sklad_pr.ID = newId;
          o_sklad_pr.D_START = now;
          o_sklad_pr.M_ORG_ID = uc.M_ORG_ID;
          o_sklad_pr.USERID = uc.ID;

        }

        db.O_SKLAD_PR.Add(o_sklad_pr);


        // продукция
        //
        // получаю из базы
        var db_o_sklad_pr_product = db.O_SKLAD_PR_PRODUCT.AsNoTracking()
                                        .Where(x => x.O_SKLAD_PR_ID == o_sklad_pr.ID).ToList();
        // удаляю из базы
        foreach(var item in db_o_sklad_pr_product) {
          db.O_SKLAD_PR_PRODUCT.Remove(db.O_SKLAD_PR_PRODUCT.Find(item.ID));
        }
        
        //
        // обновляю те, которые были в базе
        foreach(var item in db_o_sklad_pr_product) {
        
          var from_request = o_sklad_pr_product.Where(x => x.ID == item.ID).FirstOrDefault();
          
          if (from_request != null) {
            item.M_PRODUCT_ID = from_request.M_PRODUCT_ID;
            item.KOLVO = from_request.KOLVO;
            item.COST = from_request.COST;
            o_sklad_pr_product[o_sklad_pr_product.IndexOf(from_request)] = item;
          }

        }
        //
        // проставляю значения системным полям
        foreach(var item in o_sklad_pr_product) {
          
          // уже был
          if (item.ID != 0) {
            item.D_MODIF = now;

          // новый
          } else {

            DbRawSqlQuery<int> newIdList =
                db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_SKLAD_PR_PRODUCT_ID as int);");
            int newId = newIdList.First();

            item.ID = newId;
            item.D_START = now;
            item.USERID = uc.ID;
            item.M_ORG_ID = uc.M_ORG_ID;
            item.O_SKLAD_PR_ID = o_sklad_pr.ID;
          }

        }
        //
        // добавляю в коллекцию
        db.O_SKLAD_PR_PRODUCT.AddRange(o_sklad_pr_product);

        db.SaveChanges();

      }

      return Content(
          JsonConvert.SerializeObject(new { success = true, O_SKLAD_PR_ID = o_sklad_pr.ID }),
          "application/json");

    }


    
    // получение данных по приходу на склад
    [HttpGet]
    public ActionResult GetUchetSkladPr(int page) {

      UserContext uc = GetUserContext();

      using(ATLANTEntities db = new ATLANTEntities()) {

        O_SKLAD_PR pr = db.O_SKLAD_PR
                   .Where(x => x.M_ORG_ID == uc.M_ORG_ID)
                   .OrderByDescending(x => x.ID)
                   .Skip(page - 1)
                   .FirstOrDefault();

        List<O_SKLAD_PR_PRODUCT> productList = null;

        if (pr != null) {
          productList = db.O_SKLAD_PR_PRODUCT.Where(x => x.O_SKLAD_PR_ID == pr.ID).ToList();
        }

        List<int> pageNums = new List<int>();
        for(int i = 1; i <= db.O_SKLAD_PR.Where(x => x.M_ORG_ID == uc.M_ORG_ID).Count(); i += 1) {
          pageNums.Add(i);
        }

        return Content(
          JsonConvert.SerializeObject(new { success = true,
                                            o_sklad_pr = pr,
                                            o_sklad_pr_product = productList,
                                            pageNums = pageNums }),
          "application/json");
        
      }
   
    }
    

    // получить максимальный номер счёта + 1 для Прихода на склад
    [HttpGet]
    public ActionResult GetUchetSkladPrNSchetNext() {

      UserContext uc = GetUserContext();

      using(ATLANTEntities db = new ATLANTEntities()) {

        SqlParameter pM_org_id = new SqlParameter("@m_org_id", GetUserContext().M_ORG_ID);
        pM_org_id.SqlDbType = SqlDbType.Int;
        DbRawSqlQuery<string> newIdList = db.Database
          .SqlQuery<string>(
            "select cast(isnull(max(cast(p.N_SCHET as int)), 0) as varchar(500))" +
            " from dbo.O_SKLAD_PR p where p.M_ORG_ID = @m_org_id", pM_org_id );
        string s = newIdList.First();
        int r;
        int.TryParse(s, out r);
        
        // говорят, что номера счёта будут целыми числами, но я не
        // уверен, поэтому делаю проверку
        //
        // самый первый счет
        if (s == "0") {
          return Content(JsonConvert.SerializeObject(new { success = true, N_SCHET = 1}), "application/json");

        // числовой счёт
        } else if (r != 0) {
          r += 1;
          return Content(JsonConvert.SerializeObject(new { success = true, N_SCHET = r}), "application/json");

        // строковый счёт
        } else {
          s = s + "1";
          return Content(JsonConvert.SerializeObject(new { success = true, N_SCHET = s}), "application/json");
        }

      }

    }





    // получение данных по расходу со склада
    [HttpGet]
    public ActionResult GetUchetSkladRas(int? page, int? O_SKLAD_RAS_ID) {
    
      const int LAST_PAGE = -1;

      UserContext uc = GetUserContext();
      DateTime now = CreateDate();

      using(ATLANTEntities db = new ATLANTEntities()) {

        List<int> pageNums = new List<int>();
        int pageCount = db.O_SKLAD_RAS.Where(x => x.M_ORG_ID == uc.M_ORG_ID).Count();

        // если нет ни одного расхода, то возвращаю пустой результат, это
        // заставит режим создать сразу новую запись
        if (pageCount == 0) {
          
          return Content(JsonConvert.SerializeObject(
            new { success = true, pageNums = pageNums }), "application/json");
        }

        for(int i = pageCount; i >= 1 && pageNums.Count < 10; i -= 1) {
          pageNums.Add(i);
        }

        if (page == LAST_PAGE) {
          page = pageCount;
        }


        O_SKLAD_RAS ras;
        
        if (page != null) {

          ras = db.O_SKLAD_RAS
                    .Where(x => x.M_ORG_ID == uc.M_ORG_ID)
                    .OrderBy(x => x.ID)
                    .Skip(page.Value - 1)
                    .FirstOrDefault();

        } else if (O_SKLAD_RAS_ID != null) {

          ras = db.O_SKLAD_RAS.Find(O_SKLAD_RAS_ID.Value);

          if (ras == null) {
            return HttpNotFound();
          }

        } else {

          return HttpNotFound("В GetUchetSkladRas оба параметра пусты: page и O_SKLAD_RAS_ID");

        }

        // если расход по анкете, то получаю данные из анкеты
        if (ras.O_ANK_ID != null) {

          O_ANK o = db.O_ANK.Find(ras.O_ANK_ID);

          if (o == null) {
            return HttpNotFound();
          }

          ras.SURNAME = o.SURNAME;
          ras.NAME = o.NAME;
          ras.SECNAME = o.SECNAME;
          ras.STREET = 
            (o.STREET ?? "") + 
            " " + (o.HOUSE ?? "") +
            " " + (o.CORPUS ?? "") +
            (o.FLAT == null ? "" : ("-" + o.FLAT))
          ;
          ras.POST_INDEX = o.POST_INDEX;
          ras.PHONE_MOBILE = o.PHONE_MOBILE;

        }

        List<RasProdViewModel> productList = null;
        SkladRasUvedomlViewModel uvedoml = new SkladRasUvedomlViewModel();


        if (ras != null) {

          productList = db.O_SKLAD_RAS_PRODUCT.Where(x => x.O_SKLAD_RAS_ID == ras.ID)
            .Select(x => new RasProdViewModel {o_sklad_ras_product = x})
            .ToList();

          foreach(var item in productList) {
            item.o_sklad_ras_product_opl = db.O_SKLAD_RAS_PRODUCT_OPL
              .Where(x => x.O_SKLAD_RAS_PRODUCT_ID == item.o_sklad_ras_product.ID)
              .ToList();

            // приостановка абонемента
            item.o_abon_priost = db.O_ABON_PRIOST.Where(x => x.O_SKLAD_RAS_PRODUCT_ID == item.o_sklad_ras_product.ID &&
                                                             x.D_PRIOST_PO >= now.Date).FirstOrDefault();
          }


          // Уведомления
          var uList = db.O_UVEDOML.Where(x => x.O_SKLAD_RAS_ID == ras.ID).ToList();
          O_UVEDOML u1 = uList.Where(x => x.O_SKLAD_RAS_NOMER == 1).FirstOrDefault();
          O_UVEDOML u2 = uList.Where(x => x.O_SKLAD_RAS_NOMER == 2).FirstOrDefault();
          O_UVEDOML u3 = uList.Where(x => x.O_SKLAD_RAS_NOMER == 3).FirstOrDefault();
          O_UVEDOML u4 = uList.Where(x => x.O_SKLAD_RAS_NOMER == 4).FirstOrDefault();
          O_UVEDOML u5 = uList.Where(x => x.O_SKLAD_RAS_NOMER == 5).FirstOrDefault();

          if (u1 != null) {
            uvedoml.d_sob1 = u1.D_SOB;
          }

          if (u2 != null) {
            uvedoml.d_sob2 = u2.D_SOB;
          }

          if (u3 != null) {
            uvedoml.d_sob3 = u3.D_SOB;
          }

          if (u4 != null) {
            uvedoml.d_sob4 = u4.D_SOB;
          }

          if (u5 != null) {
            uvedoml.d_sob5 = u5.D_SOB;
          }
          // /уведомления


        } else {
          return HttpNotFound("Couldn't find O_SKLAD_RAS, variable ras is null");
        }

        return Content(
          JsonConvert.SerializeObject(new { success = true,
                                            o_sklad_ras = ras,
                                            productList = productList,
                                            pageNums = pageNums,
                                            uvedoml = uvedoml }),
            "application/json"
          );
        
      }
   
    }




    // создать уведомление для Учёт - Расод со склада
    private void CreateSkladRasUvedoml(int o_sklad_ras_nomer, DateTime d_sob, O_SKLAD_RAS o_sklad_ras, O_ANK ank, SkladRasUvedomlViewModel uvedoml, DateTime now, UserContext uc, ATLANTEntities db) {
    
      // получаю ФИО и телефон, расход может быть создан как по анкете, так и без неё
      string fio = "";
      string phone = "";
      if (o_sklad_ras.O_ANK_ID != null && ank != null) {
        fio = (ank.SURNAME ?? "") + " " + (ank.NAME ?? "") + " " + (ank.SECNAME ?? "");
        phone = ank.PHONE_MOBILE ?? ank.PHONE_HOME;
      } else {
        fio = (o_sklad_ras.SURNAME ?? "") + " " + (o_sklad_ras.NAME ?? "") + " " + (o_sklad_ras.SECNAME ?? "");
        phone = o_sklad_ras.PHONE_MOBILE;
      }


      // если напоминаний ещё нет, то группа генерируется, иначе берётся существующая
      int gr = 0;
      // для первого уведомления вид уведомления из интерфейса, для остальных Звонок
      int m_vid_sob_id = 0;
      // для первого уведомления комментарий из интерфейса, для остальных пусто
      string comment = "";

      // если уже есть созданные групповые напоминания, то gr будет больше ноля
      gr = db.O_UVEDOML.Where(x => x.O_SKLAD_RAS_ID == o_sklad_ras.ID && x.O_SKLAD_RAS_NOMER >= 1)
                       .FirstOrDefault()?.GR ?? 0;

      if (gr == 0) {
        gr = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_UVEDOML_GR as int);").First();
      }

      // для уведомлений, кроме 2, 3, 4, 5 вид события и комментарий из интерфейса
      if (!(new int[4] {2, 3, 4, 5}).Contains(o_sklad_ras_nomer)) {
        m_vid_sob_id = uvedoml.m_vid_sob_id.Value;
        comment = uvedoml.comment;

      // для остальных вид "Звонок" и комментарий не задан
      } else {
        m_vid_sob_id = M_VID_SOB_ZVONOK;
        comment = null;
      }

      O_UVEDOML u = new O_UVEDOML() {
        FIO = fio,
        PHONE = phone,
        O_ANK_ID = o_sklad_ras.O_ANK_ID,
        M_VID_SOB_ID = m_vid_sob_id,
        D_SOB = d_sob,
        COMMENT = comment,
        ISP = 0,
        D_START = now,
        D_MODIF = null,
        USERID = uc.ID,
        M_ORG_ID = uc.M_ORG_ID,
        O_SEANS_ID = null,
        O_KONT_ANK_ID = null,
        O_SKLAD_RAS_ID = o_sklad_ras.ID,
        GR = gr,
        O_SKLAD_RAS_NOMER = o_sklad_ras_nomer
      };

      // #365 Не храним ФИО для анкет
      if (u.O_ANK_ID.HasValue) {
        u.FIO = null;
      }

      db.O_UVEDOML.Add(u);
      db.SaveChanges();


      // комментария для уведомлений 2, 3, 4, 5 нет, для остальных - есть
      if (!((new int[4] {2, 3, 4, 5}).Contains(o_sklad_ras_nomer))) {
        O_UVEDOML_GR_COMMENT comm = new O_UVEDOML_GR_COMMENT() {
          ID = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_UVEDOML_GR_COMMENT_ID as int);").First(),
          D_START = now,
          D_MODIF = null,
          M_ORG_ID = uc.M_ORG_ID,
          USERID = uc.ID,
          O_UVEDOML_GR = u.GR,
          O_UVEDOML_ID = u.ID,
          COMMENT = uvedoml.comment
        };

        db.O_UVEDOML_GR_COMMENT.Add(comm);
        db.SaveChanges();
      }

    }


    // сохранить Учёт - Продажа
    [HttpPost]
    public ActionResult UchetSkladRasSave(O_SKLAD_RAS o_sklad_ras, 
      IList<RasProdViewModel> productList, SkladRasUvedomlViewModel uvedoml) {

      // для отправки смс
      string message = "";

      // избавляюсь от разницы +4 часа
      DateTimeToUniversalTime(o_sklad_ras);
      foreach(var item in productList) {
        DateTimeToUniversalTime(item.o_sklad_ras_product);
        DateTimeToUniversalTime(item.o_abon_priost);
        foreach(var item1 in item.o_sklad_ras_product_opl) {
          DateTimeToUniversalTime(item1);
        }
      }

      DateTimeToUniversalTime(uvedoml);


      o_sklad_ras.SURNAME = Capitalize(o_sklad_ras.SURNAME);
      o_sklad_ras.NAME = Capitalize(o_sklad_ras.NAME);
      o_sklad_ras.SECNAME = Capitalize(o_sklad_ras.SECNAME);

      UserContext uc = GetUserContext();
      DateTime now = CreateDate();

      using(ATLANTEntities db = new ATLANTEntities()) {

        o_sklad_ras.D_MODIF = now;

        // редактирование расхода
        if (o_sklad_ras.ID != 0) {

          O_SKLAD_RAS db_o_sklad_ras = db.O_SKLAD_RAS.AsNoTracking().Where(x => x.ID == o_sklad_ras.ID).FirstOrDefault();

          if (db_o_sklad_ras == null) {
            return HttpNotFound("Расход не найден: ID = " + db_o_sklad_ras.ID);
          }

          db.O_SKLAD_RAS.Remove(db.O_SKLAD_RAS.Find(db_o_sklad_ras.ID));

          o_sklad_ras.M_ORG_ID = uc.M_ORG_ID;
          o_sklad_ras.USERID = uc.ID;

        // новый расход
        } else {

          DbRawSqlQuery<int> newIdList = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_SKLAD_RAS_ID as int);");
          int newId = newIdList.First();

          o_sklad_ras.ID = newId;
          o_sklad_ras.D_START = now;
          o_sklad_ras.M_ORG_ID = uc.M_ORG_ID;
          o_sklad_ras.USERID = uc.ID;

        }

        db.O_SKLAD_RAS.Add(o_sklad_ras);

        // для логирования нужно получить ФИО и телефон
        string info = "";
        // ФИО могут быть введены без анкеты
        var ank = db.O_ANK.Where(x => x.ID == o_sklad_ras.O_ANK_ID).FirstOrDefault();
        
        if (ank != null) {
          info = (ank.SURNAME ?? "") + " " + (ank.NAME ?? "") + " " + (ank.SECNAME ?? "") + " телефон " + (ank.PHONE_MOBILE ?? "");
        } else {
          info = (o_sklad_ras.SURNAME ?? "") + " " + (o_sklad_ras.NAME ?? "") + " " + (o_sklad_ras.SECNAME ?? "") +
                 " телефон " + (o_sklad_ras.PHONE_MOBILE ?? "");
        }

        // отправляем смс по факту продажи
        foreach (var e in productList) {
          message = "";
          string name = db.M_PRODUCT.Where(x => x.ID == e.o_sklad_ras_product.M_PRODUCT_ID).FirstOrDefault().NAME;
          bool sale = false;  // признак продажи
          
          // сохраненный товар  
          if (e.o_sklad_ras_product.ID != 0) {
            var p = db.O_SKLAD_RAS_PRODUCT.Where(x => x.ID == e.o_sklad_ras_product.ID).FirstOrDefault();
            if (p != null) {
              // в БД товар еще не выкуплен, из клиента пришел последний платеж
              if (p.OPL_OST > 0 && e.o_sklad_ras_product.OPL_OST == 0) {
                sale = true;
              }
            }
          } else {
            // за товар заплачено полностью
            if (e.o_sklad_ras_product.OPL_OST == 0) {
              sale = true;
            }
          }

          if (sale) { // если товар продан, отправляем
            SmsCallAccountData a = GetApiAccountData();
            if (a.login != "" && a.password != "") {
              if (a.phone != "") {
                message += uc.M_ORG_ID_NAME + ", " + "продажа товара " + name + " цена " + e.o_sklad_ras_product.COST.ToString();
                SendSmsMessage(a.phone, message, a.sender);
              }
            }
          }
        }

        // продукция
        //
        // получаю из базы
        var db_o_sklad_ras_product = db.O_SKLAD_RAS_PRODUCT.AsNoTracking().Where(x => x.O_SKLAD_RAS_ID == o_sklad_ras.ID).ToList();

        // удаляю из базы
        foreach(var item in db_o_sklad_ras_product) {
          db.O_SKLAD_RAS_PRODUCT.Remove(db.O_SKLAD_RAS_PRODUCT.Find(item.ID));
        }
        //
        // по всем продуктам, пришедшим с клиента
        foreach(var item in productList) {
        
          var r = db_o_sklad_ras_product.Where(x => x.ID == item.o_sklad_ras_product.ID).FirstOrDefault();

          item.o_sklad_ras_product.D_MODIF = now;

          O_DEISTV o = new O_DEISTV();
          var p = db.M_PRODUCT.Where(y => y.ID == item.o_sklad_ras_product.M_PRODUCT_ID).FirstOrDefault();

          if (p == null) {
            p.NAME = "";
          }

          string prod = "", mess = "";

          // если подарок
          mess = uc.UserName + " Добавил(а) новый расход со склада ФИО: ";

          if (item.o_sklad_ras_product.COST == 0) {
            prod = " товар '" + (p.NAME ?? "") + "'" + " в подарок";
          } else {
            prod = " товар '" + (p.NAME ?? "") + "'" + " стоимость " + item.o_sklad_ras_product.COST.ToString();
          }

          // обновляю те, которые были в базе
          if (r != null) {
            
            item.o_sklad_ras_product.D_START = r.D_START;
            item.o_sklad_ras_product.M_ORG_ID = r.M_ORG_ID;
            item.o_sklad_ras_product.USERID = r.USERID;

            // изменили цену товара
            if (r.TSENA != item.o_sklad_ras_product.TSENA) {
              o.MESS = uc.UserName + " Изменил(а) цену товара '" + (p.NAME ?? "") +
                       "' ФИО: " + info +
                       ", было " + r.TSENA.ToString() + ", стало " + item.o_sklad_ras_product.TSENA.ToString() +
                       ", стоимость: было " + r.COST.ToString() + ", стало " + item.o_sklad_ras_product.COST.ToString();
              o.O_SKLAD_RAS_ID = r.O_SKLAD_RAS_ID;
              o.D_START = CreateDate();
              o.M_ORG_ID = uc.M_ORG_ID;
              o.USERID = uc.ID;
              o.M_DEISTV_ID = M_DEISTV_UCHET;
              db.O_DEISTV.Add(o);
            }

            // выдали товар - в БД не выдан, из клиента пришла выдача
            if (r.IS_VID == 0 && item.o_sklad_ras_product.IS_VID == 1) {
              o.MESS = uc.UserName + " Выдал(а) со склада ФИО: " + info + prod + ", дата выдачи " + getDateddMMyyyyStr(item.o_sklad_ras_product.D_VID);
              o.O_SKLAD_RAS_ID = r.O_SKLAD_RAS_ID;
              o.D_START = CreateDate();
              o.M_ORG_ID = uc.M_ORG_ID;
              o.USERID = uc.ID;
              o.M_DEISTV_ID = M_DEISTV_VYDANO;
              db.O_DEISTV.Add(o);
            }

          // новые, введённые продукты
          } else {

            DbRawSqlQuery<int> newIdList = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_SKLAD_RAS_PRODUCT_ID as int);");
            int newId = newIdList.First();

            item.o_sklad_ras_product.ID = newId;
            item.o_sklad_ras_product.D_START = now;
            item.o_sklad_ras_product.USERID = uc.ID;
            item.o_sklad_ras_product.M_ORG_ID = uc.M_ORG_ID;
            item.o_sklad_ras_product.O_SKLAD_RAS_ID = o_sklad_ras.ID;

            // сохраняем действие
            // ввели товар
            o.MESS = mess + info + prod;
            o.O_SKLAD_RAS_ID = o_sklad_ras.ID;
            o.M_DEISTV_ID = M_DEISTV_UCHET;
            o.D_START = CreateDate();
            o.M_ORG_ID = uc.M_ORG_ID;
            o.USERID = uc.ID;
            db.O_DEISTV.Add(o);
            
            // если дополнительно выдали товар
            if (item.o_sklad_ras_product.IS_VID == 1) {
              o.MESS = uc.UserName + " Выдал(а) со склада ФИО: " + info + prod + ", дата выдачи " + getDateddMMyyyyStr(item.o_sklad_ras_product.D_VID);
              o.M_DEISTV_ID = M_DEISTV_VYDANO;
              db.O_DEISTV.Add(o);
            }

            // если продан абонемент, добавляем информацию в сопровождение
            if (p.IS_ABON == 1) {
              var sopr = db.O_SOPR.Where(x => x.O_ANK_ID == o_sklad_ras.O_ANK_ID && x.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();

              if (sopr != null) {
                if (sopr.M_SOPR_STATUS_ID != 1) { // купил
                  sopr.M_SOPR_STATUS_ID = 1;
                  sopr.IS_SROCHNO = 0;
                }
              } else {
                O_SOPR s = new O_SOPR() {
                  D_START = now,
                  M_ORG_ID = uc.M_ORG_ID,
                  USERID = uc.ID,
                  O_ANK_ID = o_sklad_ras.O_ANK_ID,
                  M_SOPR_STATUS_ID = 1,
                  IS_SROCHNO = 0
                };

                db.O_SOPR.Add(s);
              }
            }
          }

          // добавляю в коллекцию
          db.O_SKLAD_RAS_PRODUCT.Add(item.o_sklad_ras_product);



          // частичная оплата
          //
          // получаю из базы
          var db_o_sklad_ras_product_opl = 
            db.O_SKLAD_RAS_PRODUCT_OPL.AsNoTracking()
              .Where(x => x.O_SKLAD_RAS_PRODUCT_ID == item.o_sklad_ras_product.ID).ToList();
          //
          // удаляю из базы
          foreach(var opl in db_o_sklad_ras_product_opl) {
            db.O_SKLAD_RAS_PRODUCT_OPL.Remove(db.O_SKLAD_RAS_PRODUCT_OPL.Find(opl.ID));
          }

          // по всем частичным оплатам пришедшим с клиента
          foreach(var opl in item.o_sklad_ras_product_opl) {

            var op = db_o_sklad_ras_product_opl.Where(x => x.ID == opl.ID).FirstOrDefault();

            opl.D_MODIF = now;

            // обновляю те, которые были в базе
            if (op != null) {
            
              opl.D_START = op.D_START;
              opl.M_ORG_ID = op.M_ORG_ID;
              opl.USERID = op.USERID;

              // изменили сумму платежа
              if (op.OPL != opl.OPL && op.OPL != null) {
                // сохраняем действие
                o.MESS = uc.UserName + " Изменил(а) сумму платежа ФИО " + info + " товар '" + (p.NAME ?? "") + "' сумма: " +
                         "было " + op.OPL.ToString() + ", стало " + opl.OPL.ToString();
                o.O_SKLAD_RAS_ID = o_sklad_ras.ID;
                o.M_DEISTV_ID = M_DEISTV_UCHET;
                o.D_START = CreateDate();
                o.M_ORG_ID = uc.M_ORG_ID;
                o.USERID = uc.ID;
                db.O_DEISTV.Add(o);
              }

            // новые, введённые частичные оплаты
            } else {

              DbRawSqlQuery<int> newIdList = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_SKLAD_RAS_PRODUCT_OPL_ID as int);");
              int newId = newIdList.First();

              opl.ID = newId;
              opl.D_START = now;
              opl.USERID = uc.ID;
              opl.M_ORG_ID = uc.M_ORG_ID;
              opl.O_SKLAD_RAS_PRODUCT_ID = item.o_sklad_ras_product.ID;

              // Ввели новый платеж
              // сохраняем действие
              if (opl.OPL != null) {
                o.MESS = uc.UserName + " Провел(а) новый платеж ФИО " + info + " товар '" + (p.NAME ?? "") + "' сумма " + opl.OPL.ToString();
                o.O_SKLAD_RAS_ID = o_sklad_ras.ID;
                o.M_DEISTV_ID = M_DEISTV_UCHET;
                o.D_START = CreateDate();
                o.M_ORG_ID = uc.M_ORG_ID;
                o.USERID = uc.ID;
                db.O_DEISTV.Add(o);
              }

            }

            // добавляю в коллекцию
            db.O_SKLAD_RAS_PRODUCT_OPL.Add(opl);


          }





          // сохранение информации о приостановке абонемента dbo.O_ABON_PRIOST
          //
          O_ABON_PRIOST o_abon_priost = item.o_abon_priost;
          // если какая-то приостановка пришла
          if (o_abon_priost != null) {

            o_abon_priost.M_ORG_ID = uc.M_ORG_ID;
            o_abon_priost.USERID = uc.ID;

            // редактирование приостановки
            if (o_abon_priost.ID != 0) {
              O_ABON_PRIOST db_o_abon_priost = db.O_ABON_PRIOST.Find(o_abon_priost.ID);
              db.O_ABON_PRIOST.Remove(db.O_ABON_PRIOST.Find(db_o_abon_priost.ID));
              o_abon_priost.D_MODIF = now;

              // поменялись даты приостановки
              int? cnt1 = (db_o_abon_priost.D_PRIOST_PO - db_o_abon_priost.D_PRIOST_S)?.Days;
              int? cnt2 = (o_abon_priost.D_PRIOST_PO - o_abon_priost.D_PRIOST_S)?.Days;
              // на тот случай, если даты удалили, значит надо удалить и приостановку и вернуть всё, как было
              if (!cnt2.HasValue) {
                cnt2 = 0;
              }
              if (cnt1.HasValue && cnt2.HasValue && cnt1.Value != cnt2.Value) {
                if (item.o_sklad_ras_product.D_DEISTV.HasValue) {
                  item.o_sklad_ras_product.D_DEISTV = 
                    item.o_sklad_ras_product.D_DEISTV.Value.AddDays(cnt2.Value - cnt1.Value);                  
                }
              }

            // новая приостановка
            }  else {
              o_abon_priost.ID = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_ABON_PRIOST_ID as int);").First();
              o_abon_priost.D_START = now;
              o_abon_priost.O_ANK_ID = o_sklad_ras.O_ANK_ID;
              o_abon_priost.O_SKLAD_RAS_PRODUCT_ID = item.o_sklad_ras_product.ID;

              // увеличиваю дату действия
              if (item.o_sklad_ras_product.D_DEISTV.HasValue) {
                if (o_abon_priost.D_PRIOST_S != null && o_abon_priost.D_PRIOST_PO != null) {
                  int cnt = (o_abon_priost.D_PRIOST_PO.Value - o_abon_priost.D_PRIOST_S.Value).Days + 1;
                  item.o_sklad_ras_product.D_DEISTV =
                    item.o_sklad_ras_product.D_DEISTV.Value.AddDays(cnt);
                }
              }

            }

            // добавляю только если есть обе даты
            if (o_abon_priost.D_PRIOST_S != null && o_abon_priost.D_PRIOST_PO != null) {
              db.O_ABON_PRIOST.Add(o_abon_priost);
            }

          }


          



          
        }
        //
        db.SaveChanges();





        // оповещение, если товар был продан дешевле, чем он стоит у Дилера A
        // идентификтор Дилера A
        int m_org_id_a = 0;
        if (uc.M_ORG_TYPE_ID == M_ORG_TYPE_ID_DILER_A) {
          m_org_id_a = uc.M_ORG_ID;
        
        // под администрацией создавать нельзя, т.к. нет возможности
        // найти соответствующего дилера A
        } else if (uc.M_ORG_ID == M_ORG_ID_ADMINISTRATSIYA) {
          return HttpNotFound("Couldn't create notification by administration login, sign in with any Diler D login to proceed");

        } else {

           int loopCount = 10;
           int m_org_id_curr = uc.PARENT_M_ORG_ID;
           M_ORG parent = null;
           do { 
             parent = db.M_ORG.Where(x => x.ID == m_org_id_curr).FirstOrDefault();
             if (parent.M_ORG_TYPE_ID == M_ORG_TYPE_ID_DILER_A) {
               m_org_id_a = parent.ID;
             } else {
               m_org_id_curr = parent.PARENT_ID;
             }
           } while (parent != null && m_org_id_a == 0 && (--loopCount > 0));

           if (m_org_id_a == 0) {
             return HttpNotFound("Не удалось найти Дилера A для текущего салона");
           }          
        }

        // ищу товары, которые были проданы дешевле, чем у Дилера A
        SqlParameter pM_org_id_a = new SqlParameter("@m_org_id_a", m_org_id_a);
        pM_org_id_a.SqlDbType = SqlDbType.Int;
        SqlParameter pO_sklad_ras_id = new SqlParameter("@o_sklad_ras_id", o_sklad_ras.ID);
        pO_sklad_ras_id.SqlDbType = SqlDbType.Int;
        var deshevo = db.Database.SqlQuery<O_SKLAD_RAS_PRODUCT>("exec dbo.GET_DESHEVAYA_PRODAJA @m_org_id_a = @m_org_id_a, @o_sklad_ras_id = @o_sklad_ras_id;", pM_org_id_a, pO_sklad_ras_id).ToList();

        if (deshevo.Count > 0) {
          foreach(var item in deshevo) {
            O_OPOV opov = new O_OPOV() {
              ID = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_OPOV_ID as int)").First(),
              D_START = now,
              D_MODIF = null,
              M_ORG_ID = uc.M_ORG_ID,
              M_ORG_ID_SOURCE = null, // не задаётся для этого типа
              USERID = uc.ID,
              O_ANK_ID = o_sklad_ras.O_ANK_ID,
              O_ANK_ID_SOURCE = null, // не задаётся для этого типа
              O_SKLAD_RAS_ID = o_sklad_ras.ID,
              O_SKLAD_RAS_PRODUCT_ID = item.ID,
              TIP = O_OPOV_TIP_DESHEVAYA_PRODAJA,
              M_ORG_ID_A = m_org_id_a
            };
            db.O_OPOV.Add(opov);
          }
          db.SaveChanges();
        }



        // Создание уведомлений
        // делаю в цикле, т.к. у нас 2, 3, 4, 5 уведомления одинаковые, получаю
        // значение даты через reflection, по имени свойства, они имеют имена
        // d_sob2 ..., d_sob5
        for(int i = 2; i <= 5; i += 1) {
          DateTime? d_sob = (DateTime?)uvedoml.GetType().GetProperty("d_sob" + i).GetValue(uvedoml, null);
          if (d_sob.HasValue) {
            // проверяю, не создано ли уже это уведомление
            bool exists = false;
            exists = db.O_UVEDOML.Any(x => x.O_SKLAD_RAS_ID == o_sklad_ras.ID && x.O_SKLAD_RAS_NOMER == i);
            if (!exists) {
              CreateSkladRasUvedoml(i, d_sob.Value, o_sklad_ras, ank, uvedoml, now, uc, db);
            }
          }
        }
        // если создано какое-то уведомление кроме 2, 3, 4, 5
        if (uvedoml.d_sob.HasValue && uvedoml.m_vid_sob_id.HasValue) {
          int o_sklad_ras_nomer;
          // если создано обязательное уведомление на доплату (уведомление 1)
          if (uvedoml.isUved1Created) {
            o_sklad_ras_nomer = 1;
          } else {
            // если какое-то пользовательское необязательное уведомление, то присваиваю ему новый номер
            o_sklad_ras_nomer = (db.O_UVEDOML.Where(x => x.O_SKLAD_RAS_ID == o_sklad_ras.ID).Max(x => x.O_SKLAD_RAS_NOMER) ?? 5) + 1;
            // номера 1, 2, 3, 4, 5 - это специальные события, их нельзя использовать
            if (o_sklad_ras_nomer < 6) {
              o_sklad_ras_nomer = 6;
            }
          }
          CreateSkladRasUvedoml(o_sklad_ras_nomer, uvedoml.d_sob.Value, o_sklad_ras, ank, uvedoml, now, uc, db);
        }
        // /создание уведомлений
       
      }

      return Content(
          JsonConvert.SerializeObject(new { success = true, O_SKLAD_RAS_ID = o_sklad_ras.ID }),
          "application/json");
          
    }







    // получить максимальный номер счёта + 1 для Расхода со склада
    [HttpGet]
    public ActionResult GetUchetSkladRasNSchetNext() {

      UserContext uc = GetUserContext();

      using(ATLANTEntities db = new ATLANTEntities()) {

        SqlParameter pM_org_id = new SqlParameter("@m_org_id", GetUserContext().M_ORG_ID);
        pM_org_id.SqlDbType = SqlDbType.Int;
        DbRawSqlQuery<string> newIdList = db.Database
          .SqlQuery<string>(
            "select cast(isnull(max(cast(r.N_SCHET as int)), 0) as varchar(500))" +
            " from dbo.O_SKLAD_RAS r where r.M_ORG_ID = @m_org_id", pM_org_id );
        string s = newIdList.First();
        int r;
        int.TryParse(s, out r);
        
        // говорят, что номера счёта будут целыми числами, но я не
        // уверен, поэтому делаю проверку
        //
        // самый первый счет
        if (s == "0") {
          return Content(JsonConvert.SerializeObject(new { success = true, N_SCHET = 1}), "application/json");

        // числовой счёт
        } else if (r != 0) {
          r += 1;
          return Content(JsonConvert.SerializeObject(new { success = true, N_SCHET = r}), "application/json");

        // строковый счёт
        } else {
          s = s + "1";
          return Content(JsonConvert.SerializeObject(new { success = true, N_SCHET = s}), "application/json");
        }

      }

    }




    public ActionResult PrintKassOrder() {
    
      return View(); 

    }
    


    private List<SkladData> GetSkladData(int M_ORG_ID) {

      using (ATLANTEntities db = new ATLANTEntities()) {

        SqlParameter pMOrgId = new SqlParameter("@m_org_id", M_ORG_ID);
        pMOrgId.SqlDbType = SqlDbType.Int;

        var d = db.Database.SqlQuery<SkladData>("EXEC [dbo].[GET_SKLAD_DATA] @m_org_id = @m_org_id", pMOrgId)
                  .ToList();

        return d;

      }

    }


    [HttpGet]
    public ContentResult GetSkladDataRequest() {
      
      UserContext uc = GetUserContext();
      var sklad = GetSkladData(uc.M_ORG_ID).ToList();
      return Content(JsonConvert.SerializeObject(sklad), "application/json");
      
    }

    public ActionResult PrintPrihod() {
      return View();
    }

    public ContentResult GetPrihodData(DateTime? dtFrom, DateTime? dtTo) {
      UserContext uc = GetUserContext();
      DateTime d0 = CreateDate(), d1 = CreateDate();

      if (dtFrom.HasValue) d0 = dtFrom.Value.ToUniversalTime();
      if (dtTo.HasValue) d1 = dtTo.Value.ToUniversalTime();

      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from a in db.O_SKLAD_PR
                from b in db.O_SKLAD_PR_PRODUCT.Where(x => x.O_SKLAD_PR_ID == a.ID).DefaultIfEmpty()
                from c in db.M_PRODUCT.Where(z => z.ID == b.M_PRODUCT_ID).DefaultIfEmpty()
                where (a.M_ORG_ID == uc.M_ORG_ID) &&
                      (DbFunctions.TruncateTime(a.D_SCHET) >= d0.Date) &&
                      (DbFunctions.TruncateTime(a.D_SCHET) <= d1.Date)
                select new {
                  a.N_SCHET,
                  D_SCHET = a.D_SCHET.Value,
                  NAME = c.NAME,
                  b.KOLVO
                };

        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    // Добавить информацию о звонке
    public ContentResult GetZvonokCommentData(int ID) {
      using (ATLANTEntities db = new ATLANTEntities()) {

        if (db.O_ZVONOK.Any(x => x.O_ANK_ID == ID)) {
          var d = db.O_ZVONOK.Where(x => x.O_ANK_ID == ID).Max(x => x.ID);

          var z = from a in db.O_ZVONOK where (a.ID <= d && a.O_ANK_ID == ID)
                  select new {
                    a.ID,
                    a.O_ANK_ID,
                    a.COMMENT,
                    a.OPERATOR
                  };
          return Content(JsonConvert.SerializeObject(z.ToList().OrderByDescending(x => x.ID)), "application/json");
        } else {
          return Content(JsonConvert.SerializeObject(null), "application/json");
        }
      }
    }

    public ContentResult GetUchetSkladRasDoc(int? page, int? id) {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        O_RAS_DOK ras = null;

        if (page != null) {
          ras = db.O_RAS_DOK
                   .Where(x => x.M_ORG_ID == uc.M_ORG_ID && 
                          (id == null || x.ID == id))
                   .OrderByDescending(x => x.ID)
                   .Skip(page.Value - 1)
                   .FirstOrDefault();
        } else if (id != null) {
          ras = db.O_RAS_DOK.Find(id);
        }

        List<int> pageNums = new List<int>();
        if (ras != null) {
          for (int i = 1; i <= db.O_RAS_DOK.Where(x => x.M_ORG_ID == uc.M_ORG_ID).ToList().Count(); i++) {
            pageNums.Add(i);
          }
        }

        return Content(
            JsonConvert.SerializeObject(new {
              success = true,
              o_ras_doc = ras,
              pageNums = pageNums
            }),
            "application/json");
      }
    }

    // получить максимальный номер счёта + 1 для расходных документов
    [HttpGet]
    public ActionResult GetUchetRasDocNSchetNext() {

      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {

        SqlParameter pM_org_id = new SqlParameter("@m_org_id", GetUserContext().M_ORG_ID);
        pM_org_id.SqlDbType = SqlDbType.Int;
        DbRawSqlQuery<string> newIdList = db.Database
          .SqlQuery<string>(
            "select cast(isnull(max(cast(rd.N_SCHET as int)), 0) as varchar(500))" +
            " from dbo.O_RAS_DOK rd where rd.M_ORG_ID = @m_org_id", pM_org_id );
        string s = newIdList.First();
        int r;
        int.TryParse(s, out r);


        // самый первый счет
        if (s == null) {
          return Content(JsonConvert.SerializeObject(new { success = true, N_SCHET = 1 }), "application/json");
        } else if (r != 0) { // числовой счёт
          r += 1;
          return Content(JsonConvert.SerializeObject(new { success = true, N_SCHET = r }), "application/json");
        } else { // строковый счёт
          s = s + "1";
          return Content(JsonConvert.SerializeObject(new { success = true, N_SCHET = s }), "application/json");
        }
      }
    }

    [HttpPost]
    public ActionResult UchetRasDocSave (O_RAS_DOK r) {
      UserContext uc = GetUserContext();
      O_DEISTV o = new O_DEISTV();

      using (ATLANTEntities db = new ATLANTEntities()) {
        if (r.D_SCHET.HasValue) r.D_SCHET = r.D_SCHET.Value.ToUniversalTime();
        if (r.ID == 0) {
          r.D_START = CreateDate();
          r.USERID = uc.ID;
          r.M_ORG_ID = uc.M_ORG_ID;
          db.O_RAS_DOK.Add(r);

          // отправляем смс ответственному при расходе средств
          SmsCallAccountData a = GetApiAccountData();
          if (a.login != "" && a.password != "") {
            if (a.phone != "") {

              string message = "";
              
              if (uc.M_ORG_ID_NAME != "") {
                message = uc.M_ORG_ID_NAME + ", ";
              }

              //message += "выдача средств: ";
              
              if (r.SUMMA_VID.HasValue) {
                message += "выдано " + r.SUMMA_VID.ToString() + ", ";
              }

              if (r.SUMMA_RASH.HasValue) {
                message += "сумма " + r.SUMMA_RASH.ToString() + ", ";
              }

              if (r.VOZVR.HasValue) {
                message += "возврат " + r.VOZVR.ToString() + ", ";
              }

              if (r.RASHOD.HasValue) {
                message += "расходовано " + r.RASHOD.ToString();
              }

              string buf = message.Substring(message.Length - 2);
              if (buf == ", ") {
                string temp = message.Substring(0, message.Length - 2);
                message = temp;
              }

              SendSmsMessage(a.phone,message,a.sender);
            }
          }

          // сохраняем лог
          o.MESS = uc.UserName + " Добавил(а) расходный документ" +
                   " статья " + (db.M_RASHOD_STAT.Where(x => x.ID == r.M_RASHOD_STAT_ID).FirstOrDefault().NAME) + 
                   ", сумма " + r.SUMMA_RASH.ToString();

        } else {
          var s = db.O_RAS_DOK.Find(r.ID);
          s.D_MODIF = CreateDate();

          if(r.SUMMA_RASH != s.SUMMA_RASH) {
            o.MESS = uc.UserName + " Изменил(а) расходный документ" +
                   " статья " + (db.M_RASHOD_STAT.Where(x => x.ID == r.M_RASHOD_STAT_ID).FirstOrDefault().NAME) +
                   ", сумма: было " + s.SUMMA_RASH.ToString() +
                   ", стало " + r.SUMMA_RASH.ToString();
          }

          db.Entry(s).CurrentValues.SetValues(r);
        }
        db.SaveChanges();

        o.M_DEISTV_ID = M_DEISTV_RASHODY;
        o.O_RAS_DOK_ID = r.ID;
        if (o.MESS != null) {
          SaveDeistv(o);
        }

      }
      return Content(JsonConvert.SerializeObject(new { success = true }),"application/json");
    }

    [HttpGet]
    public ActionResult UchetReportsSpisPokup() {
      return View();
    }

    // получаем данные списка покупателей
    [HttpGet]
    public ContentResult UchetReportsSpisPokupData(DateTime? date0, DateTime? date1, int? page, int? ostalos_dn_abon_ot, int? ostalos_dn_abon_do, int? m_method_opl_id, int? vip, int? rows_per_page) {

      // количество строк на странице
      int ROWS_PER_PAGE = 10;

      UserContext uc = GetUserContext();

      date0 = DateTimeToUniversalTime(date0);
      date1 = DateTimeToUniversalTime(date1);

      if (!date0.HasValue) {
        date0 = SmallDateTimeMinValue;
      }

      if (!date1.HasValue) {
        date1 = SmallDateTimeMaxValue;
      }

      if (!page.HasValue) {
        page = 1;
      }

      if (!ostalos_dn_abon_ot.HasValue) {
        ostalos_dn_abon_ot = int.MinValue;
      }

      if (!ostalos_dn_abon_do.HasValue) {
        ostalos_dn_abon_do = int.MaxValue;
      }

      using (ATLANTEntities db = new ATLANTEntities()) {
        SqlParameter pMOrgId = new SqlParameter("@m_org_id", uc.M_ORG_ID);
        pMOrgId.SqlDbType = SqlDbType.Int;

        SqlParameter pDate0 = new SqlParameter("@date0", date0);
        pDate0.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter pDate1 = new SqlParameter("@date1", date1);
        pDate1.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter pOstalos_dn_abon_ot = new SqlParameter("@ostalos_dn_abon_ot", SqlDbType.Int);
        pOstalos_dn_abon_ot.Value = ostalos_dn_abon_ot;

        SqlParameter pOstalos_dn_abon_do = new SqlParameter("@ostalos_dn_abon_do", SqlDbType.Int);
        pOstalos_dn_abon_do.Value = ostalos_dn_abon_do;

        SqlParameter pM_method_opl_id = new SqlParameter("@m_method_opl_id", SqlDbType.Int);
        pM_method_opl_id.Value = DBNullOrValue(m_method_opl_id);

        SqlParameter pVip = new SqlParameter("@vip", SqlDbType.Int);
        pVip.Value = DBNullOrValue(vip);

        SqlParameter pPage = new SqlParameter("@page", SqlDbType.Int);
        pPage.Value = page;

        SqlParameter pRows_per_page = new SqlParameter("@rows_per_page", SqlDbType.Int);
        pRows_per_page.Value = rows_per_page.Value;

        SqlParameter pRecCnt = new SqlParameter("@recCnt", SqlDbType.Int);
        pRecCnt.Direction = ParameterDirection.Output;

        List<UchetSpisPokupData> d = db.Database.SqlQuery<UchetSpisPokupData>(
          "EXEC [dbo].[GET_SKLAD_POKUP_DATA] @m_org_id = @m_org_id, @date0 = @date0, @date1 = @date1, @ostalos_dn_abon_ot = @ostalos_dn_abon_ot, @ostalos_dn_abon_do = @ostalos_dn_abon_do, @m_method_opl_id = @m_method_opl_id, @vip = @vip, @page = @page, @rows_per_page = @rows_per_page, @recCnt = @recCnt out", 
          pMOrgId, pDate0, pDate1, pOstalos_dn_abon_ot, pOstalos_dn_abon_do, pM_method_opl_id, pVip, pPage, pRows_per_page, pRecCnt
        ).ToList();

        int pageCnt = (int)pRecCnt.Value / ROWS_PER_PAGE;
        if ((int)pRecCnt.Value % ROWS_PER_PAGE > 0) {
          pageCnt = pageCnt + 1;
        }

        List<int> pageNums = new List<int>();
        for(int i = 1; i <= pageCnt; i += 1) {
          pageNums.Add(i);
        }

        return Content(JsonConvert.SerializeObject(new {
            spisok =  d.ToList(),
            pageNums = pageNums
          }), "application/json"
        );
      }
    }

    [HttpGet]
    public ActionResult Dev() {

      return View();

    }

    [HttpGet]
    public ActionResult UchetReportsDebetZadol() {
      return View();
    }

    // получаем данные дебиторской задолженности
    public ContentResult UchetReportsDebetZadolData(DateTime? date0, DateTime? date1) {
      UserContext uc = GetUserContext();

      // избавляюсь от разницы +4 часа
      date0 = DateTimeToUniversalTime(date0);
      date1 = DateTimeToUniversalTime(date1);

      using (ATLANTEntities db = new ATLANTEntities()) {
        SqlParameter pMOrgId = new SqlParameter("@m_org_id", uc.M_ORG_ID);
        pMOrgId.SqlDbType = SqlDbType.Int;

        //SqlParameter pDate0 = new SqlParameter("@date0", date0);
        //pDate0.SqlDbType = SqlDbType.SmallDateTime;

        //SqlParameter pDate1 = new SqlParameter("@date1", date1);
        //pDate1.SqlDbType = SqlDbType.SmallDateTime;

        var d = db.Database.SqlQuery<UchetDebetZadolData>("EXEC [dbo].[GET_SKLAD_DEBET_ZADOL_DATA] @m_org_id = @m_org_id", pMOrgId);

        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }



    // данные для печати кассового ордера
    [HttpGet]
    public ActionResult GetKassOrder(int ID) {

      using (ATLANTEntities db = new ATLANTEntities()) {


        SqlParameter pId = new SqlParameter("@id", ID);
        pId.SqlDbType = SqlDbType.Int;

        var d = db.Database.SqlQuery<KassOrderViewModel>("EXEC [dbo].[GET_KASS_ORDER] @id = @id", pId);
        KassOrderViewModel ko = d.First(); 

        return Content(JsonConvert.SerializeObject(ko), "application/json");

      }
      
    }

    
    [HttpGet]
    public ActionResult PrintProplZaPer() {
      return View();
    }

    // данные для печати "Проплаты за период"
    [HttpGet]
    public ActionResult GetProplZaPer(DateTime dateBeg, DateTime dateEnd) {

      // избавляюсь от разницы +4 часа
      dateBeg = DateTimeToUniversalTime(dateBeg);
      dateEnd = DateTimeToUniversalTime(dateEnd);

      using (ATLANTEntities db = new ATLANTEntities()) {

        SqlParameter pM_org_id = new SqlParameter("@m_org_id", GetUserContext().M_ORG_ID);
        pM_org_id.SqlDbType = SqlDbType.Int;

        SqlParameter pDateBeg = new SqlParameter("@dateBeg", dateBeg);
        pDateBeg.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter pDateEnd = new SqlParameter("@dateEnd", dateEnd);
        pDateEnd.SqlDbType = SqlDbType.SmallDateTime;

        var d = db.Database.SqlQuery<ProplZaPerViewModel>(
          "EXEC [dbo].[GET_PROPL_ZA_PER] @m_org_id = @m_org_id, @dateBeg = @dateBeg, @dateEnd = @dateEnd",
          pM_org_id, pDateBeg, pDateEnd);

        return Content(JsonConvert.SerializeObject(d), "application/json");

      }
      
    }



    // данные для режима Друзья
    [HttpGet]
    public ActionResult GetDruzya(int O_ANK_ID) {

      /*
       * Структура:
        var person = {
          priglasil: "Петрова Елена Петровна",
          bonus: 1,
          aktivist: 1,
          kolvo_rek: 50
        };
      */


    
      using (ATLANTEntities db = new ATLANTEntities()) {

        var r = db.O_ANK.Find(O_ANK_ID);

        if (r == null) {
          return Content(JsonConvert.SerializeObject(new { priglasil = "", bonus = 0, aktivist = 0, kolvo_prigl = 0 }), "application/json");
        }


        // кто пригласил
        var p = db.O_ANK.Where(x => x.ID == r.FIO_INFO_ID).FirstOrDefault();
        string priglasil;
        if (p != null) {
          priglasil = (p.SURNAME ?? "") + " " + (p.NAME ?? "") + " " + (p.SECNAME ?? "");
        } else {
          priglasil = "";
        }


        // количество рекомендованных
        int kolvo_prigl = db.O_REK_ANK.Where(x => x.O_ANK_ID_REK == O_ANK_ID && x.O_ANK_ID != null).Count();


        return Content(JsonConvert.SerializeObject(new {
          priglasil = priglasil, bonus = r.BONUS, aktivist = r.AKTIVIST, kolvo_prigl = kolvo_prigl
        }), "application/json");

      }
      
    }


    // Общение, Статусы
    [HttpGet]
    public ActionResult GetDialogProductStatusList(int O_ANK_ID) {

      // текущая покупка, по которой платятся взносы (если есть такая)
      using (ATLANTEntities db = new ATLANTEntities()) {


        SqlParameter pO_ank_id = new SqlParameter("@o_ank_id", O_ANK_ID);
        pO_ank_id.SqlDbType = SqlDbType.Int;

        var d = db.Database.SqlQuery<DialogProductStatusViewModel>(
          "EXEC [dbo].[GET_DIALOG_PRODUCT_STATUS_LIST] @o_ank_id = @o_ank_id",
          pO_ank_id);


        return Content(JsonConvert.SerializeObject(d), "application/json");

      }


    }



    // Общение, Товар
    [HttpGet]
    public ActionResult GetDialogProductList(int O_ANK_ID) {

      // последний купленный товар, если он есть
      using (ATLANTEntities db = new ATLANTEntities()) {


        SqlParameter pO_ank_id = new SqlParameter("@o_ank_id", O_ANK_ID);
        pO_ank_id.SqlDbType = SqlDbType.Int;

        var d = db.Database.SqlQuery<DialogProductViewModel>(
          "EXEC [dbo].[GET_DIALOG_PRODUCT_LIST] @o_ank_id = @o_ank_id",
          pO_ank_id).ToList();

        d.ForEach(x => {
          string sD_vid = "";
          if (x.d_vid.HasValue) {
            sD_vid = x.d_vid.Value.ToString("dd.MM.yy");
          }
          string sD_deistv = "";
          if (x.d_deistv.HasValue) {
            sD_deistv = x.d_deistv.Value.ToString("dd.MM.yy");
          }
          x.abonDeistvSPo = x.is_abon == 1 ? ($"(с {sD_vid} по {sD_deistv})") : "";
        });


        return Content(JsonConvert.SerializeObject(d), "application/json");

      }


    }

    [HttpGet]
    // Учет - Зарплата - Печать
    public ActionResult PrintZarpl() {
      return View();
    }

    [HttpGet]
    // Учет - Отчеты - Дебиторская задолженность - Печать
    public ActionResult PrintDebetZadol() {
      return View();
    }

    [HttpGet]
    // 
    public ActionResult PrintSpisPokup()
    {
      return View();
    }

    [HttpGet]
    // Учет - Отчеты - Отчет о доходах
    public ActionResult UchetReportsOtchetDohod() {
      return View();
    }

    [HttpGet]
    // Учет - Отчеты - Отчет о доходах - Печать
    public ActionResult PrintOtchetDohod() {
      return View();
    }



    // Учет - Отчеты - Отчет за период
    [HttpGet]
    public ActionResult GetUchetReportsOtchetZaPer(int year) {

      using (ATLANTEntities db = new ATLANTEntities()) {

        SqlParameter pM_org_id = new SqlParameter("@m_org_id", GetUserContext().M_ORG_ID);
        pM_org_id.SqlDbType = SqlDbType.Int;

        SqlParameter pYear = new SqlParameter("@year", year);
        pYear.SqlDbType = SqlDbType.Int;

        var d = db.Database.SqlQuery<UchetReportsOtchetZaPerViewModel>(
          "EXEC [dbo].[GET_UCHET_REPORTS_OTCHET_ZA_PER] @m_org_id = @m_org_id, @year = @year",
          pM_org_id, pYear);

        return Content(JsonConvert.SerializeObject(d), "application/json");

      }

    }



    // Учет - Отчеты - Отчет за период, получение доступных для выбора годов формирования отчета
    [HttpGet]
    public ActionResult GetUchetReportsOtchetZaPerYears() {

      using (ATLANTEntities db = new ATLANTEntities()) {

        SqlParameter pM_org_id = new SqlParameter("@m_org_id", GetUserContext().M_ORG_ID);
        pM_org_id.SqlDbType = SqlDbType.Int;

        var d = db.Database.SqlQuery<int>(
          "EXEC [dbo].[GET_UCHET_REPORTS_OTCHET_ZA_PER_YEARS] @m_org_id = @m_org_id",
          pM_org_id);


        return Content(JsonConvert.SerializeObject(d), "application/json");

      }

    }


    




    // Добавить запись в Контакты - Рекомендованные
    [HttpPost]
    public ActionResult AddO_REK_ANK(int o_ank_id, string surname, string name, string secname, string phone) {

      UserContext uc = GetUserContext();
      DateTime now = CreateDate();
      using (ATLANTEntities db = new ATLANTEntities()) {

        O_REK_ANK o = new O_REK_ANK {
          D_START = now,
          M_ORG_ID = uc.M_ORG_ID,
          NAME = name,
          O_ANK_ID = null,
          PHONE = phone,
          SECNAME = secname,
          SURNAME = surname,
          SKR = 0,
          USERID = uc.ID,
          O_ANK_ID_REK = o_ank_id // кто его рекомендует
        };

        db.O_REK_ANK.Add(o);

        db.SaveChanges();


        return Content(JsonConvert.SerializeObject(new {id = o.ID, success = true}), "application/json");

      }

    }



    // получить Приглашенных для режима Друзья
    [HttpGet]
    public ActionResult GetPriglashen(int o_ank_id, DateTime? fromDate, DateTime? toDate) {

      fromDate = DateTimeToUniversalTime(fromDate);
      toDate = DateTimeToUniversalTime(toDate);

      DateTime nowDate = CreateDate().Date;

      fromDate = fromDate ?? nowDate;
      toDate = toDate ?? nowDate;

      using (ATLANTEntities db = new ATLANTEntities()) {

        var r = db.O_REK_ANK.Where(x => x.O_ANK_ID_REK == o_ank_id && x.O_ANK_ID != null)
          .Join(db.O_ANK.Where(x => DbFunctions.TruncateTime(x.DATE_REG) >= fromDate &&
                                    DbFunctions.TruncateTime(x.DATE_REG) <= toDate),
                rek => rek.O_ANK_ID,
                ank => ank.ID, (rek, ank) => new {
            fio = (ank.SURNAME ?? " ") + " " + (ank.NAME ?? " ") + " " + (ank.SECNAME ?? ""),
            bonus = (ank.BONUS == 1 ? "Есть бонус" : "Нет бонуса"),
            d_prigl = ank.DATE_REG
          })
        ;


        return Content(JsonConvert.SerializeObject(r), "application/json");

      }

    }



    [HttpGet]
    // шаблон квыпадающего списка с множественным выбором (Учёт - Отчёты - Фильтр товаров)
    public ActionResult Multiselect() {
      return View();
    }

    // получаем данные отчета о доходах - таблица статистики
    public ContentResult UchetReportsDohodData(DateTime? date0, DateTime? date1) {
      UserContext uc = GetUserContext();

      // избавляюсь от разницы +4 часа
      date0 = DateTimeToUniversalTime(date0);
      date1 = DateTimeToUniversalTime(date1);

      using (ATLANTEntities db = new ATLANTEntities()) {
        SqlParameter pMOrgId = new SqlParameter("@m_org_id", uc.M_ORG_ID);
        pMOrgId.SqlDbType = SqlDbType.Int;

        SqlParameter pDate0 = new SqlParameter("@date0", date0);
        pDate0.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter pDate1 = new SqlParameter("@date1", date1);
        pDate1.SqlDbType = SqlDbType.SmallDateTime;

        var d = db.Database.SqlQuery<UchetDohodData>("EXEC [dbo].[GET_OTCHET_BUH_DATA] @m_org_id = @m_org_id, @date0 = @date0, @date1 = @date1",
                                                     pMOrgId, pDate0, pDate1);

        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }




    // бухгалтерия за период
    // s_user_id - если 0 - то по всем сотрудникам, если не 0, то по заданному сотруднику
    // m_org_id - на странице дилера А и С - валовый доход по списку для i-ой организации
    private OtchetBuhDataViewModel GetOtchetBuhData(DateTime? date0, DateTime? date1, int s_user_id, int? m_org_id) {

      UserContext uc = GetUserContext();
      DateTime now = CreateDate();

      date0 = DateTimeToUniversalTime(date0);
      date0 = date0 ?? now.Date;
      date1 = DateTimeToUniversalTime(date1);
      date1 = date1 ?? now.Date;

      using (ATLANTEntities db = new ATLANTEntities()) {

        SqlParameter pMOrgId = new SqlParameter("@m_org_id", uc.M_ORG_ID);
        pMOrgId.SqlDbType = SqlDbType.Int;
        if (m_org_id != null) {
          pMOrgId.Value =  m_org_id.Value;
        }

        SqlParameter pDate0 = new SqlParameter("@date0", date0);
        pDate0.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter pDate1 = new SqlParameter("@date1", date1);
        pDate1.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter pSUserId = new SqlParameter("@s_user_id", s_user_id);
        pSUserId.SqlDbType = SqlDbType.Int;

        var d = db.Database.SqlQuery<OtchetBuhDataViewModel>(
          "EXEC [dbo].[GET_OTCHET_BUH_DATA] @m_org_id = @m_org_id, @date0 = @date0, @date1 = @date1, @s_user_id = @s_user_id",
          pMOrgId, pDate0, pDate1, pSUserId).First();

        return d;

      }
    }




    // получаем данные отчета о доходах - расходы, детально
    public ContentResult UchetReportsDohodDetRashodData(DateTime? date0, DateTime? date1) {

      UserContext uc = GetUserContext();

      // избавляюсь от разницы +4 часа
      date0 = DateTimeToUniversalTime(date0);
      date1 = DateTimeToUniversalTime(date1);

      using (ATLANTEntities db = new ATLANTEntities()) {
        SqlParameter pMOrgId = new SqlParameter("@m_org_id", uc.M_ORG_ID);
        pMOrgId.SqlDbType = SqlDbType.Int;

        SqlParameter pDate0 = new SqlParameter("@date0", date0);
        pDate0.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter pDate1 = new SqlParameter("@date1", date1);
        pDate1.SqlDbType = SqlDbType.SmallDateTime;

        var d = db.Database.SqlQuery<UchetRashodData>("EXEC [dbo].[GET_OTCHET_BUH_RASHOD_DATA] @m_org_id = @m_org_id, @date0 = @date0, @date1 = @date1",
                                                     pMOrgId, pDate0, pDate1);

        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }




    // сохранить Дилер A - Календарь продаж
    [HttpPost]
    public ActionResult KalenProdSave(O_KALEN_PROD kp)
    {

      // избавляюсь от разницы +4 часа
      DateTimeToUniversalTime(kp);



      kp.NAME_AK = Capitalize(kp.NAME_AK);

      UserContext uc = GetUserContext();
      DateTime now = CreateDate();

      using(ATLANTEntities db = new ATLANTEntities()) {

        kp.D_MODIF = now;

        // редактирование календаря
        if (kp.ID != 0) {

          O_KALEN_PROD db_o_kalen_prod = db.O_KALEN_PROD.AsNoTracking().Where(x => x.ID == kp.ID).FirstOrDefault();

          if (db_o_kalen_prod == null) {
            return HttpNotFound("Календарь продаж не найден: ID = " + db_o_kalen_prod.ID);
          }

          db.O_KALEN_PROD.Remove(db.O_KALEN_PROD.Find(db_o_kalen_prod.ID));

          kp.M_ORG_ID = uc.M_ORG_ID;
          kp.USERID = uc.ID;

        // новый календарь продаж
        } else {

          DbRawSqlQuery<int> newIdList = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_KALEN_PROD_ID as int);");
          int newId = newIdList.First();

          kp.ID = newId;
          kp.D_START = now;
          kp.M_ORG_ID = uc.M_ORG_ID;
          kp.USERID = uc.ID;

        }

        db.O_KALEN_PROD.Add(kp);
        db.SaveChanges();
       
      }

      return Content(
          JsonConvert.SerializeObject(new { success = true, O_KALEN_PROD_ID = kp.ID }),
          "application/json");
          
    }

    

    //// избавиться от разницы дат в 4ре часа,
    // в метод можно передать объект, полями которого являются даты,
    // тогда метод преобразует все встречающиеся даты в нужный часовой пояс
    public void DateTimeToUniversalTime(Object o) {

      if (o == null) {
        return;
      }

      // объект, в полях которого могут быть даты одна или несколько
      Type objType = o.GetType();
      //
      foreach(var i in objType.GetProperties()) {
        Type propType = i.PropertyType;        
        propType = Nullable.GetUnderlyingType(propType) ?? propType;
        if (propType == typeof(DateTime)) {
          DateTime? d = (DateTime?)i.GetValue(o);
          if (d != null) {
            i.SetValue(o, d.Value.ToUniversalTime());
          }
        }
      }


    }


    // избавиться от разницы дат в 4ре часа,
    // в качестве параметра передаётся дата, часовой пояс
    // которой надо компенсировать
    public DateTime DateTimeToUniversalTime(DateTime d) {

      return d.ToUniversalTime();

    }

    // избавиться от разницы дат в 4ре часа,
    // в качестве параметра передаётся дата, часовой пояс
    // которой надо компенсировать
    public DateTime? DateTimeToUniversalTime(DateTime? d) {

      if (d.HasValue) {
        return d.Value.ToUniversalTime();
      } else {
        return d;
      }

    }




    // получение данных Дилер A - Календарь продаж
    // god - год календаря, 
    // mes - месяц календаря
    [HttpGet]
    public ActionResult GetKalenProd(int god, int mes) {

      UserContext uc = GetUserContext();
      DateTime now = CreateDate();

      using(ATLANTEntities db = new ATLANTEntities()) {

        O_KALEN_PROD kp = db.O_KALEN_PROD
            .Where(x => x.GOD == god &&
                        x.MES == mes &&
                        x.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();

        // получаю все года, за которые есть календарь
        List<int?> years = db.O_KALEN_PROD.Where(x => x.M_ORG_ID == uc.M_ORG_ID)
                                          .Select(x => x.GOD).Distinct().ToList();
        // и если ничего не найдено, то добавляю текущий год
        if (years.Count == 0) {
          years.Add(now.Date.Year);
        }

        
        // если нет календаря продаж на указанный год и месяц,
        // то возвращаю пустой результат, это
        // заставит режим создать сразу новую запись при сохранении
        if (kp == null) {
          
          return Content(JsonConvert.SerializeObject(
            new { success = true, kp = new {ID = 0, GOD = god, MES = mes}, years = years}), "application/json");

        } else {
        
          return Content(JsonConvert.SerializeObject(
            new { success = true, kp = kp, years = years}), "application/json");

        }

      }
   
    }



    
    // обновить поле dbo.O_ANK.BONUS
    [HttpPost]
    public ActionResult AnkUpdateBonus(int o_ank_id, int bonus) {

      using(ATLANTEntities db = new ATLANTEntities()) {

        O_ANK ank = db.O_ANK.Find(o_ank_id);
        if (ank == null) {
          return HttpNotFound("Не удалось найти анкету с ID = " + o_ank_id);
        }

        ank.BONUS = bonus;

        db.SaveChanges();

        return Content(JsonConvert.SerializeObject(
            new { success = true }), "application/json");

      }

    }

    /// <summary>
    /// Учет - Отчеты - Фильтр товаров
    /// </summary>
    /// <param name="fromDate"></param>
    /// <param name="toDate"></param>
    /// <returns></returns>
    [HttpGet]
    public ActionResult GetUchetReportFilterTovarov(DateTime? fromDate, DateTime? toDate, int? numPage, string idsSpecialist, string idsTovar)
    {
      // избавляюсь от разницы +4 часа
      fromDate = DateTimeToUniversalTime(fromDate);
      toDate = DateTimeToUniversalTime(toDate);

      if (!fromDate.HasValue) {
        fromDate = SmallDateTimeMinValue;
      }

      if (!toDate.HasValue) {
        toDate = SmallDateTimeMaxValue;
      }

      using (ATLANTEntities db = new ATLANTEntities()) {
        SqlParameter p_fromDate = new SqlParameter("@fromDate", fromDate);
        p_fromDate.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter p_toDate = new SqlParameter("@toDate", toDate);
        p_toDate.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter p_MOrgId = new SqlParameter("@m_org_id", GetUserContext().M_ORG_ID);
        p_MOrgId.SqlDbType = SqlDbType.Int;

        SqlParameter p_numPage = new SqlParameter("@page", numPage);
        p_numPage.SqlDbType = SqlDbType.Int;

        SqlParameter rows_per_page = new SqlParameter("@rows_per_page", 9);
        rows_per_page.SqlDbType = SqlDbType.Int;
        

        SqlParameter p_idsSpecialist = new SqlParameter("@idsSpecialist", idsSpecialist);
        p_idsSpecialist.SqlDbType = SqlDbType.VarChar;

        SqlParameter p_idsTovar = new SqlParameter("@idsTovar", idsTovar);
        p_idsTovar.SqlDbType = SqlDbType.VarChar;

        // ничего не выбрано
        if (idsSpecialist == ",") {
          p_idsSpecialist.Value = "";
        }

        if (idsTovar == ",") {
          p_idsTovar.Value = "";
        }

        List<UchetReportsFilterTovarovViewModel> report = db.Database.SqlQuery<UchetReportsFilterTovarovViewModel>(
            @"EXEC [dbo].[GET_UCHET_REPORT_FILTER_TOVAROV] 
                @fromDate = @fromDate
                , @toDate = @toDate
                , @m_org_id = @m_org_id
                , @page = @page
                , @rows_per_page = @rows_per_page
                , @idsSpecialist = @idsSpecialist
                , @idsTovar = @idsTovar", 
                
                  p_fromDate
                , p_toDate
                , p_MOrgId
                , p_numPage
                , rows_per_page
                , p_idsSpecialist
                , p_idsTovar).ToList();

        return Content(JsonConvert.SerializeObject(report), "application/json");
      }
    }


    // записать ползователя в журнале входа в систему
    // запись при первом использовании системы в день
    // учёт ведётся 1 раз в день, нужно для отчётов
    public ActionResult SaveUserDSign() {

      UserContext uc = GetUserContext();
        
      using(ATLANTEntities db = new ATLANTEntities()) {
        
        DateTime now = CreateDate();

        
        S_USER u = db.S_USER.Where(x => x.AspNetUsersId == uc.AspNetUsersId).FirstOrDefault();

        if (u == null) {
          throw new Exception("Не удалось найти пользователя " + uc.AspNetUsersId);
        }


        S_USER_SIGN_LOG l = db.S_USER_SIGN_LOG
                              .Where(x => x.S_USER_ID == u.ID &&
                                          DbFunctions.TruncateTime(x.D_SIGN) == now.Date)
                              .FirstOrDefault();

        // если сегодня ещё нет регистрации в журнале - добавляю
        if (l == null) {

          l = new S_USER_SIGN_LOG {
            S_USER_ID = u.ID,
            D_SIGN = now
          };

          db.S_USER_SIGN_LOG.Add(l);

          db.SaveChanges();

        }

        return Content(JsonConvert.SerializeObject(new {success = true}), "application/json");

      }

    }




    // получение зарплаты
    // page = 0 - вернуть информацию для новой страницы,
    // page > 0 - вернуть информацию по сохранённой странице номер page
    [HttpGet]
    public ActionResult GetZarpl(int page) {


      UserContext uc = GetUserContext();
      DateTime now = CreateDate();

      using(ATLANTEntities db = new ATLANTEntities()) {

        // ищу заголовок зарплат
        O_ZARPL zarpl;
        if (page != 0) {
          zarpl = db.O_ZARPL.Where(x => x.M_ORG_ID == uc.M_ORG_ID).OrderByDescending(x => x.ID)
                    .Skip(page - 1).Take(1).FirstOrDefault();
        } else {
          zarpl = new O_ZARPL {
            ID = 0,
            D_PERIOD_S = now,
            D_PERIOD_PO = now
          };
        }

        if (zarpl != null) {
          SqlParameter pId = new SqlParameter("@id", zarpl.ID);
          pId.SqlDbType = SqlDbType.Int;

          SqlParameter pMOrgId = new SqlParameter("@m_org_id", uc.M_ORG_ID);
          pMOrgId.SqlDbType = SqlDbType.Int;

          var zarplFio = db.Database.SqlQuery<ZarplFioViewModel>("exec dbo.GET_ZARPL @m_org_id = @m_org_id, @id = @id ", pMOrgId, pId).ToList();

          return Content(JsonConvert.SerializeObject(new { zarpl = zarpl, zarplFio = zarplFio }), "application/json");
        } else {
          var zarplFio = new List<ZarplFioViewModel>();

          return Content(JsonConvert.SerializeObject(new { zarpl = zarpl, zarplFio = zarplFio }), "application/json");
        }

      }      
      

    }



    // получение количество страниц в зарплате
    [HttpGet]
    public ActionResult GetZarplPages() {


      UserContext uc = GetUserContext();
      DateTime now = CreateDate();

      using(ATLANTEntities db = new ATLANTEntities()) {

        // ищу заголовок зарплат
        List<int> pages = new List<int>();
        for (int i = 1; i <= db.O_ZARPL.Count(); i += 1) {
          pages.Add(i);
        }
        

        return Content(JsonConvert.SerializeObject(pages), "application/json");

      }      
      

    }



     // получение валового дохода по сотруднику за период
    [HttpGet]
    public ActionResult GetZarplValovDohod(DateTime? d_period_s, DateTime? d_period_po) {

      UserContext uc = GetUserContext();
      DateTime now = CreateDate();

      // избавляюсь от разницы в 4ре часа
      d_period_s = DateTimeToUniversalTime(d_period_s);
      d_period_po = DateTimeToUniversalTime(d_period_po);

      using(ATLANTEntities db = new ATLANTEntities()) {

        var sotr = db.S_USER.Where(x => x.M_ORG_ID == uc.M_ORG_ID)
            .Select(x => new ZarplFioViewModel {
              S_USER_ID = x.ID
            })
            .ToList();

        // валовый доход
        sotr = sotr.Select(x => {
          if (d_period_s.HasValue && d_period_po.HasValue) {
            x.VALOV_DOHOD = GetOtchetBuhData(
                d_period_s, d_period_po, x.S_USER_ID.Value, null).VALOV_DOHOD;
          } else {
            x.VALOV_DOHOD = 0;
          }
          return x;
        }).ToList();

        return Content(JsonConvert.SerializeObject(sotr), "application/json");

      }

    }




    // сохранение зарплаты
    [HttpPost]
    public ActionResult SaveZarpl(O_ZARPL o_zarpl, IList<O_ZARPL_FIO> o_zarpl_fio) {


      UserContext uc = GetUserContext();
      DateTime now = CreateDate();

      // избавляюсь от разницы в 4ре часа
      DateTimeToUniversalTime(o_zarpl);
      foreach(var item in o_zarpl_fio) {
        DateTimeToUniversalTime(item);
      }

      using(ATLANTEntities db = new ATLANTEntities()) {
        

        o_zarpl.D_MODIF = now;

        // редактирование зарплаты
        if (o_zarpl.ID != 0) {

          O_ZARPL db_o_zarpl = db.O_ZARPL.AsNoTracking().Where(x => x.ID == o_zarpl.ID).FirstOrDefault();

          if (db_o_zarpl == null) {
            return HttpNotFound("Зарплата не найдена: ID = " + o_zarpl.ID);
          }

          db.O_ZARPL.Remove(db.O_ZARPL.Find(db_o_zarpl.ID));

          o_zarpl.M_ORG_ID = uc.M_ORG_ID;
          o_zarpl.USERID = uc.ID;

        // новая зарплата
        } else {

          DbRawSqlQuery<int> newIdList = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_ZARPL_ID as int);");
          int newId = newIdList.First();

          o_zarpl.ID = newId;
          o_zarpl.D_START = now;
          o_zarpl.M_ORG_ID = uc.M_ORG_ID;
          o_zarpl.USERID = uc.ID;

        }

        db.O_ZARPL.Add(o_zarpl);


        // зарплата - сотрудники
        //
        // получаю из базы
        var db_o_zarpl_fio = db.O_ZARPL_FIO.AsNoTracking()
                                        .Where(x => x.O_ZARPL_ID == o_zarpl.ID).ToList();
        // удаляю из базы
        foreach(var item in db_o_zarpl_fio) {
          db.O_ZARPL_FIO.Remove(db.O_ZARPL_FIO.Find(item.ID));
        }
        //
        // обновляю те, которые были в базе
        foreach(var item in o_zarpl_fio) {
        

          var r = db_o_zarpl_fio.Where(x => x.ID == item.ID).FirstOrDefault();

          item.D_MODIF = now;

          // в БД уже была запись
          if (r != null) {
            
            item.D_START = r.D_START;
            item.M_ORG_ID = r.M_ORG_ID;
            item.USERID = r.USERID;

          //  в БД записи не было
          } else {

            DbRawSqlQuery<int> newIdList =
                db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_ZARPL_FIO_ID as int);");
            int newId = newIdList.First();

            item.ID = newId;
            item.D_START = now;
            item.USERID = uc.ID;
            item.M_ORG_ID = uc.M_ORG_ID;
            item.O_ZARPL_ID = o_zarpl.ID;

          }

          // добавляю в коллекцию
          db.O_ZARPL_FIO.Add(item);


        }

        db.SaveChanges();

        return Content(JsonConvert.SerializeObject(new {success = true}), "application/json");

      }      
      

    }


    [HttpGet]
    public JsonResult GetInventData() {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from a in db.O_INVENT
                where (a.M_ORG_ID == uc.M_ORG_ID)
                orderby a.IS_SPISAN, a.ID
                select
                     new {
                       a.ID,
                       a.NAME,
                       a.KOLVO,
                       a.COST,
                       a.INV_NUM,
                       a.IS_SPISAN,
                       a.COMMENT,
                       PHOTO_SIZE = a.PHOTO != null ? 1 : 0,
                       CHECK_PHOTO_SIZE = a.CHECK_PHOTO != null ? 1 : 0
                     };
        return Json(d.ToList(), JsonRequestBehavior.AllowGet);
      }
    }

    [HttpGet]
    public ActionResult GetInventPhoto(int? id) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        O_INVENT a;
        a = db.O_INVENT.Find(id);

        if (a == null) {
          return HttpNotFound();
        }

        if (a.PHOTO != null) {
          return File(a.PHOTO, "image/jpg");
        } else {
          return File(System.IO.File.ReadAllBytes(Server.MapPath("~") + EMPTY_PHOTO), "image/png");
        }
      }
    }

    [HttpGet]
    public ActionResult GetInventCheckPhoto(int? id) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        O_INVENT a;
        a = db.O_INVENT.Find(id);

        if (a == null) {
          return HttpNotFound();
        }

        if (a.CHECK_PHOTO != null) {
          return File(a.CHECK_PHOTO, "image/jpg");
        } else {
          return File(System.IO.File.ReadAllBytes(Server.MapPath("~") + EMPTY_PHOTO), "image/png");
        }
      }
    }

    [HttpPost]
    public ActionResult SaveInventData (O_INVENT i, string photo, string check_photo) {
      UserContext uc = GetUserContext();

      // фото товара
      if (!String.IsNullOrEmpty(photo)) {
        i.PHOTO = Convert.FromBase64String(photo);
      }

      // фото чека товара
      if (!String.IsNullOrEmpty(check_photo)) {
        i.CHECK_PHOTO = Convert.FromBase64String(check_photo);
      }

      using (ATLANTEntities db = new ATLANTEntities()) {
        var a = db.O_INVENT.Find(i.ID);
        if (a == null) {
          i.D_START = CreateDate();
          i.USERID = uc.ID;
          i.M_ORG_ID = uc.M_ORG_ID;
          i.IS_SPISAN = 0;
          db.O_INVENT.Add(i);
        } else {
          i.D_MODIF = CreateDate();
          i.USERID = uc.ID;
          i.M_ORG_ID = uc.M_ORG_ID;
          // если фото не поменялось, не нужно его пересохранять
          if (i.PHOTO == null) i.PHOTO = a.PHOTO;
          if (i.CHECK_PHOTO == null) i.CHECK_PHOTO = a.CHECK_PHOTO;

          db.Entry(a).CurrentValues.SetValues(i);
        }
        db.SaveChanges();
      }
      return Content(JsonConvert.SerializeObject( new { success = true, 
                                                        ID = i.ID, 
                                                        PHOTO_SIZE = i.PHOTO != null ? 1 : 0,
                                                        CHECK_PHOTO_SIZE = i.CHECK_PHOTO != null ? 1 : 0
                                                      }), "application/json");
    }

    [HttpPost]
    // Списываем материал в инвентаризации
    public ActionResult SpisatInvent(int id) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        var a = db.O_INVENT.Find(id);
        if (a != null) {
          var b = a;
          b.IS_SPISAN = 1;
          db.Entry(a).CurrentValues.SetValues(b);
          db.SaveChanges();
        }
      }
      return Content(JsonConvert.SerializeObject(new { success = true }), "application/json");
    }

    public ActionResult PrintInvent() {
      return View();
    }


    // получить информацию о количестве товара на складе дилера A
    [HttpGet]
    public ActionResult GetO_DILER_A_SKLAD() {

      UserContext uc = GetUserContext();
      IList<O_DILER_A_SKLAD> s;
      IList<O_DILER_A_SKLADViewModel> model;

      using (ATLANTEntities db = new ATLANTEntities()) {

        IList<M_PRODUCT> products = db.M_PRODUCT.ToList();

        s = db.O_DILER_A_SKLAD.Where(x => x.M_ORG_ID == uc.M_ORG_ID).ToList();

        // если ещё нет информации о складе, то просто создаю пустой объект
        if (s.Count == 0) {

          model = products.Select(x => new O_DILER_A_SKLADViewModel {
            M_PRODUCT_ID = x.ID,
            KOLVO = 0,
            M_PRODUCT_NAME = x.NAME
          }).ToList();

        } else {

          model = Mapper.Map<IList<O_DILER_A_SKLADViewModel>>(s);
          model = model.Select(x => {
            x.M_PRODUCT_NAME = products.Where(y => x.M_PRODUCT_ID == y.ID)
                                       .FirstOrDefault()?.NAME ?? "(неизвестно)";
            return x;
          }).ToList();

        }

      }


      return Content(JsonConvert.SerializeObject(model), "application/json");

    }


    // сохранить информацию о количестве товара на складе дилера A
    [HttpPost]
    public ActionResult O_DILER_A_SKLADSave(IList<O_DILER_A_SKLAD> o_sklad) {

      UserContext uc = GetUserContext();
      DateTime now = CreateDate();

      using (ATLANTEntities db = new ATLANTEntities()) {

        foreach(var sklad in o_sklad) {
          
          DateTimeToUniversalTime(sklad);

          sklad.D_MODIF = now;

          // редактирование данных склада
          if (sklad.ID != 0) {

            O_DILER_A_SKLAD db_sklad = db.O_DILER_A_SKLAD.AsNoTracking()
                .Where(x => x.ID == sklad.ID).FirstOrDefault();

            if (db_sklad == null) {
              return HttpNotFound("Данные склада не найдены: ID = " + sklad.ID);
            }

            db.O_DILER_A_SKLAD.Remove(db.O_DILER_A_SKLAD.Find(db_sklad.ID));

            sklad.USERID = uc.ID;

          // новые данные склада
          } else {

            DbRawSqlQuery<int> newIdList = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_DILER_A_SKLAD_ID as int);");
            int newId = newIdList.First();

            sklad.ID = newId;
            sklad.D_START = now;
            sklad.M_ORG_ID = uc.M_ORG_ID;
            sklad.USERID = uc.ID;

          }

          db.O_DILER_A_SKLAD.Add(sklad); 

        }

        db.SaveChanges();

      }

      return Content(JsonConvert.SerializeObject(new {success = true}), "application/json");

    }



    // получить прайс дилера A
    [HttpGet]
    public ActionResult GetDilerAPrice() {

      UserContext uc = GetUserContext();
      DateTime now = CreateDate();
      IList<O_DILER_A_PRICEViewModel> model;

      using (ATLANTEntities db = new ATLANTEntities()) {

        IList<M_PRODUCT> products = db.M_PRODUCT.ToList();
      
        IList<O_DILER_A_PRICE> priceList = 
          (from pr in products
          join price in db.O_DILER_A_PRICE.Where(x => x.M_ORG_ID == uc.M_ORG_ID)
              on pr.ID equals price.M_PRODUCT_ID_TOVAR into gj
          from price in gj.DefaultIfEmpty()
          select new { product = pr, price = price ?? new O_DILER_A_PRICE()})
          .ToList()
          .Select(x => {
            x.price.M_PRODUCT_ID_TOVAR = x?.price.M_PRODUCT_ID_TOVAR ?? x.product.ID;
            return x.price;})
          .ToList()
         ;

         model = Mapper.Map<IList<O_DILER_A_PRICEViewModel>>(priceList);
         model = model.Select(x => {
             x.M_PRODUCT_TOVAR_ID_NAME = products.Where(y => y.ID == x.M_PRODUCT_ID_TOVAR)
                                                 .FirstOrDefault()?.NAME;
             return x;
         }).ToList();

         return Content(JsonConvert.SerializeObject(model), "application/json");

      }

    }


    // сохранить прайс дилера A
    [HttpPost]
    public ActionResult O_DILER_A_PRICESave(IList<O_DILER_A_PRICE> price) {

      UserContext uc = GetUserContext();
      DateTime now = CreateDate();

      using (ATLANTEntities db = new ATLANTEntities()) {

        foreach(var p in price) {
          
          DateTimeToUniversalTime(p);

          p.D_MODIF = now;

          // редактирование данных склада
          if (p.ID != 0) {

            O_DILER_A_PRICE db_price = db.O_DILER_A_PRICE.AsNoTracking()
                .Where(x => x.ID == p.ID).FirstOrDefault();

            if (db_price == null) {
              return HttpNotFound("Данные прайса не найдены: ID = " + p.ID);
            }

            db.O_DILER_A_PRICE.Remove(db.O_DILER_A_PRICE.Find(db_price.ID));

            p.USERID = uc.ID;

          // новые данные склада
          } else {

            DbRawSqlQuery<int> newIdList = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_DILER_A_PRICE_ID as int);");
            int newId = newIdList.First();

            p.ID = newId;
            p.D_START = now;
            p.M_ORG_ID = uc.M_ORG_ID;
            p.USERID = uc.ID;

          }

          db.O_DILER_A_PRICE.Add(p); 

        }

        db.SaveChanges();

      }

      return Content(JsonConvert.SerializeObject(new {success = true}), "application/json");

    }



    // получить информацию о количестве товара на складе дилера C
    [HttpGet]
    public ActionResult GetO_DILER_C_SKLAD() {

      UserContext uc = GetUserContext();
      IList<O_DILER_C_SKLAD> s;
      IList<O_DILER_C_SKLADViewModel> model;

      using (ATLANTEntities db = new ATLANTEntities()) {

        IList<M_PRODUCT> products = db.M_PRODUCT.ToList();

        s = db.O_DILER_C_SKLAD.Where(x => x.M_ORG_ID == uc.M_ORG_ID).ToList();

        // если ещё нет информации о складе, то просто создаю пустой объект
        if (s.Count == 0) {

          model = products.Select(x => new O_DILER_C_SKLADViewModel {
            M_PRODUCT_ID = x.ID,
            KOLVO = 0,
            M_PRODUCT_NAME = x.NAME
          }).ToList();

        } else {

          model = Mapper.Map<IList<O_DILER_C_SKLADViewModel>>(s);
          model = model.Select(x => {
            x.M_PRODUCT_NAME = products.Where(y => x.M_PRODUCT_ID == y.ID)
                                       .FirstOrDefault()?.NAME ?? "(неизвестно)";
            return x;
          }).ToList();

        }

      }


      return Content(JsonConvert.SerializeObject(model), "application/json");

    }


    // сохранить информацию о количестве товара на складе дилера A
    [HttpPost]
    public ActionResult O_DILER_C_SKLADSave(IList<O_DILER_C_SKLAD> o_sklad) {

      UserContext uc = GetUserContext();
      DateTime now = CreateDate();

      using (ATLANTEntities db = new ATLANTEntities()) {

        foreach(var sklad in o_sklad) {
          
          DateTimeToUniversalTime(sklad);

          sklad.D_MODIF = now;

          // редактирование данных склада
          if (sklad.ID != 0) {

            O_DILER_C_SKLAD db_sklad = db.O_DILER_C_SKLAD.AsNoTracking()
                .Where(x => x.ID == sklad.ID).FirstOrDefault();

            if (db_sklad == null) {
              return HttpNotFound("Данные склада не найдены: ID = " + sklad.ID);
            }

            db.O_DILER_C_SKLAD.Remove(db.O_DILER_C_SKLAD.Find(db_sklad.ID));

            sklad.USERID = uc.ID;

          // новые данные склада
          } else {

            DbRawSqlQuery<int> newIdList = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_DILER_C_SKLAD_ID as int);");
            int newId = newIdList.First();

            sklad.ID = newId;
            sklad.D_START = now;
            sklad.M_ORG_ID = uc.M_ORG_ID;
            sklad.USERID = uc.ID;

          }

          db.O_DILER_C_SKLAD.Add(sklad); 

        }

        db.SaveChanges();

      }

      return Content(JsonConvert.SerializeObject(new {success = true}), "application/json");

    }




    // универсальная функция Get-запроса, возвращает ответ сервера
    // headers - заголовки и их значения должны задаваться строго парами
    public string SendWebRequest(string url, string data, params string[] headers) {
      string response = "";
      try {
        System.Net.WebRequest req = System.Net.WebRequest.Create(url + "?" + data);
        //если заданы заголовки
        if (headers.Length > 0)
        { //элементов всегда четно
          for (int i = 0; i < headers.Length/2; i++)
          {
            req.Headers[headers[i * 2]] = headers[i * 2 + 1];
          }
        }
        System.Net.WebResponse resp = req.GetResponse();
        System.IO.Stream stream = resp.GetResponseStream();
        System.IO.StreamReader sr = new System.IO.StreamReader(stream);
        response = sr.ReadToEnd();
        sr.Close();
      }
      catch (Exception e) {
        response = e.Message;
      }
      return response;
    }

    // выполнился ли веб-запрос с ошибкой
    public bool IsSendRequestError(string res) {
      if (res.ToUpper().IndexOf("ERROR") >= 0) {
        return true;
      } else {
        return false;
      }
    }

    // функция получения наименования ошибки из ошибочного веб-запроса
    public string GetWebRequestErrorMessage(int ID) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = db.M_SMS_SEND_ERROR.Where(x => x.ID == ID).FirstOrDefault();
        if (d == null) {
          return "";
        } else {
          return (d.NAME ?? "");
        }
      }
    }

    // функция получения кода ошибки из ошибочного веб-запроса
    public int GetWebRequestErrorCode(string res) {
      try {
        int i = 0;
        int j = res.ToUpper().IndexOf("ERROR");
        if (j >= 0) {
          j = res.IndexOf("=") + 1;
          i = res.IndexOf("(");
          res = res.Substring(j, i - j).Trim();
        }
        bool b = int.TryParse(res, out i);
        return i;
      } catch {
        return -1;
      }
    }

    // функция отправки СМС
    // параметры:
    // phones - телефон(ы), если несколько, то через точку с запятой, например, "+79270010000;+79270020000"
    // message - сообщение, не более 800 знаков
    // sender - отправитель, пока не обрабатывается, передавать ""
    public int SendSmsMessage(string phones, string message, string sender) {
      string res = "", url = "", data = "";

      // логин или пароль не установлен
      SmsCallAccountData a = GetApiAccountData();
      if (a.login == "" || a.password == "") {
        return -2;
      }
        
      url = "https://smsc.ru/sys/send.php";
      data = "login=" + HttpUtility.UrlEncode(a.login) + "&psw=" + HttpUtility.UrlEncode(a.password) + 
             "&charset=utf-8&fmt=0&phones=" + phones + "&mes=" + message;
      res = SendWebRequest(url, data);

      // проверяем на ошибку
      if (IsSendRequestError(res)) {
        return GetWebRequestErrorCode(res) * -1;
      }

      return 0;
    }

    [HttpPost]
    public ActionResult SendSmsFromBaza(BazaListParams p, string message) {
      string buffer = "", phones = "", fio = "";
      
      int i = 0;
      p.page = 1; // всегда первая страница

      SmsCallAccountData a = GetApiAccountData();
      if (a.login == "" || a.password == "") {
        buffer = GetWebRequestErrorMessage(2); // ошибка
        return Content(JsonConvert.SerializeObject(new { success = false, message = buffer }), "application/json");
      }

      if (p.periodS.HasValue) {
        p.periodS = p.periodS.Value.ToUniversalTime();
      }

      if (p.periodPo.HasValue) {
        p.periodPo = p.periodPo.Value.ToUniversalTime();
      }

      // запрашиваем список из базы
      List<BazaListViewModel> bazalist = GetBazaListData(p, ROWS_PER_PAGE_BAZA_ALL);
      SmsCallAccountData scad = GetApiAccountData();

      if (bazalist.Count > 0) {
        UserContext uc = GetUserContext();

        using (ATLANTEntities db = new ATLANTEntities()) {

          // получаем массив для отправки сообщений
          var list = from c in bazalist
                     from b in db.O_ANK.DefaultIfEmpty()
                     where c.id == b.ID && b.PHONE_MOBILE != null
                     select new {
                       O_ANK_ID = b.ID,
                       PHONE = (b.PHONE_MOBILE ?? ""),
                       NAME = ((b.NAME + " ") ?? ""),
                       SECNAME = (b.SECNAME ?? ""),
                       SEX = (b.SEX ?? 1) 
                     };

          // очищаем массив
          bazalist = null;

          // проверяем, хватит ли баланса для отправки
          // собираем отправки в один запрос для определения стоимости
          foreach(var e in list.ToList()) {
            buffer = e.PHONE.Replace("(", "");
            buffer = buffer.Replace(")", "");
            buffer = buffer.Replace(" ", "");
            buffer = buffer.Replace("-", "");
            buffer = buffer.Replace("-", "");
            phones += buffer + ";";
            
            // берем самое длинное Имя Отчество для замены - грубый подсчет 
            if (fio.Length < (e.NAME + e.SECNAME).Length) {
              fio = e.NAME + e.SECNAME;
            }
          }

          buffer = message;
          // делаем замену для запроса
          if (message.IndexOf("<ИО>") >= 0) {
            buffer = buffer.Replace("<ИО>", fio);
          }

          // Запрашиваем стоимость отправки
          double cost = GetSmsSendCost(phones, buffer);
          if (cost < 0) {
            buffer = GetWebRequestErrorMessage(Convert.ToInt32(cost * -1));
            return Content(JsonConvert.SerializeObject(new { success = false, message = buffer }), "application/json");
          }

          double balance = GetSmsBalans();
          if (balance < 0) {
            buffer = GetWebRequestErrorMessage(Convert.ToInt32(balance * -1));
            return Content(JsonConvert.SerializeObject(new { success = false, message = buffer }), "application/json");
          }

          if (balance < cost) {
            // недостаточно средств на счете Клиента
            buffer = GetWebRequestErrorMessage(3);
            return Content(JsonConvert.SerializeObject(new { success = false, 
                                                             message = buffer + 
                                                             ": стоимость отправки " + cost.ToString() +
                                                             ", баланс " + balance.ToString() }), "application/json");
          }

          DbRawSqlQuery<int> newIdList = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_SMS_SEND_NUM as int);");
          int newId = newIdList.First();

          // сохраняем очередь отправки и отправляем смс
          foreach (var e in list.ToList()) {
            O_SMS_SEND s = new O_SMS_SEND();

            s.D_START = CreateDate();
            s.M_ORG_ID = uc.M_ORG_ID;
            s.O_ANK_ID = e.O_ANK_ID;
            s.SEND_DATE = s.D_START;
            s.SEND_LOGIN = a.login;
            s.SEND_NUM = newId;
            s.USERID = uc.ID;

            buffer = e.PHONE.Replace("(", "");
            buffer = buffer.Replace(")", "");
            buffer = buffer.Replace(" ", "");
            buffer = buffer.Replace("-", "");
            buffer = buffer.Replace("-", "");
            phones = buffer;

            // делаем замену для запроса
            buffer = message;
            if (message.IndexOf("<ИО>") >= 0) {
              buffer = buffer.Replace("<ИО>", e.NAME + e.SECNAME);
            }

            if (buffer.IndexOf("<ОК>") >= 0) {
              switch (e.SEX) {
                case 1: 
                  buffer = buffer.Replace("<ОК>", "ый");
                  break;
                case 2:
                  buffer = buffer.Replace("<ОК>", "ая");
                  break;
              }
            }

            // сохраняем обработанное сообщение
            s.SOOB = buffer;

            // отправляем смс
            i = SendSmsMessage(phones, buffer, scad.sender);

            // 0 - успешная отправка, число < 0 - код ошибки
            s.SEND_STATE = (i * -1);

            db.O_SMS_SEND.Add(s);
          }
          db.SaveChanges();

          return Content(JsonConvert.SerializeObject(new { success = true, message = "" }), "application/json");
        }
      } else {
        return Content(JsonConvert.SerializeObject(new { success = true, message = "" }), "application/json");
      }
    }

    // получаем логин и пароль из настроек по текущей организации
    public SmsCallAccountData  GetApiAccountData() {

      SmsCallAccountData a = new SmsCallAccountData();
      UserContext uc = GetUserContext();
      string buffer = "";

      a.login = "";
      a.password = "";

      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = db.O_NASTR.Where(u => u.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();
        if (d != null) {
          a.login = (d.SMS_LOGIN ?? "");
          a.password = (d.SMS_PASSWORD ?? "");
          a.sender = (d.SMS_SENDER ?? "");

          buffer = (d.PHONE_MOBILE ?? "");
          buffer = buffer.Replace("(", "");
          buffer = buffer.Replace(")", "");
          buffer = buffer.Replace(" ", "");
          buffer = buffer.Replace("-", "");
          buffer = buffer.Replace("-", "");
          a.phone = buffer;

          a.sip_key = (d.SIP_KEY ?? "");
          a.sip_secret = (d.SIP_SECRET ?? "");
        }
      }

      return a;
    }


    public double GetSmsSendCost(string phones, string message) {
      string res = "", url = "", data = "";
      double cost = 0;

      // логин или пароль не установлен
      SmsCallAccountData a = GetApiAccountData();
      if (a.login == "" || a.password == "") {
        return -2; // код ошибки, неверный пароль/логин
      }

      // получаем стоимость отправки смс, возвращает что-то вроде "4.5 (3 SMS)"
      url = "https://smsc.ru/sys/send.php";
      data = "login=" + HttpUtility.UrlEncode(a.login) + "&psw=" + HttpUtility.UrlEncode(a.password) +
             "&charset=utf-8&fmt=0&phones=" + phones + "&mes=" + message + "&cost=1";
      res = SendWebRequest(url, data);

      // проверяем на ошибку
      if (IsSendRequestError(res)) {
        return GetWebRequestErrorCode(res) * -1;
      }

      int i = res.IndexOf("(") - 1;
      res = res.Substring(0, i);

      // разделитель - точка
      Thread.CurrentThread.CurrentCulture = new CultureInfo("en-GB");
      bool b = Double.TryParse(res, out cost);
      return cost;
    }

    // 
    public double GetSmsBalans() {
      string res = "", url = "", data = "";
      double balance = 0;

      SmsCallAccountData a = GetApiAccountData();

      // логин или пароль не установлен
      if (a.login == "" || a.password == "") {
        return -2; // код ошибки, неверный пароль/логин
      }

      // получаем баланс, просто число
      url = "https://smsc.ru/sys/balance.php";
      data = "login=" + HttpUtility.UrlEncode(a.login) + "&psw=" + HttpUtility.UrlEncode(a.password);
      res = SendWebRequest(url, data);

      // проверяем на ошибку
      if (IsSendRequestError(res)) {
        return GetWebRequestErrorCode(res) * -1;
      }

      Thread.CurrentThread.CurrentCulture = new CultureInfo("en-GB");
      bool b = Double.TryParse(res, out balance);
      return balance;
    }

    /// <summary>
    /// Выполняет вызов по переданному номеру
    /// </summary>
    /// <param name="phone">номер для вызова</param>
    /// <returns></returns>
    [HttpPost]
    public ActionResult MakeACall(string phone)
    {
			//string api_key = "6599f5aae53bd4f483f4";    //должны получаться из базы
			//string secret_key = "8e8c46b504bcba5b39e9";
			//string fromPhone = "689810";

		string api_key = "";   
		string secret_key = "";
		string fromPhone = "";

		var userContext = GetUserContext();

		using (ATLANTEntities db = new ATLANTEntities())
		{
			var currentNastr = db.O_NASTR.FirstOrDefault(o => o.M_ORG_ID == userContext.M_ORG_ID);

				if (currentNastr != null && currentNastr.SIP_KEY != null && currentNastr.SIP_SECRET != null)
				{
					api_key = currentNastr.SIP_KEY;
					secret_key = currentNastr.SIP_SECRET;
				}
				else
				{
					//возврат с ошибкой
					return Content(JsonConvert.SerializeObject(new { success = false , message = "Проверьте настройки организации" }), "application/json");
				}

				var currentUser = db.S_USER.FirstOrDefault(u => u.ID == userContext.ID);
				if (currentUser != null && currentUser.SIP_LOGIN != null && currentUser.SIP_LOGIN != string.Empty)
				{
					fromPhone = currentUser.SIP_LOGIN;
				}
				else
				{
					return Content(JsonConvert.SerializeObject(new { success = false , message = "Проверьте настройки пользователя" }), "application/json");
				}
		}
		//Пока только наработка

		string res = "", url = "", data = "";

      //преобразование пришедшего номера к допустимому
      System.Text.RegularExpressions.Regex REG = new System.Text.RegularExpressions.Regex("[0-9]+");
      System.Text.RegularExpressions.MatchCollection mc = REG.Matches(phone);
      StringBuilder sb = new StringBuilder();
      foreach (System.Text.RegularExpressions.Match matc in mc)
      {
        sb.Append(matc.Value);
      }
      string toPhone = sb.ToString();

      url = "https://api.zadarma.com/v1/request/callback/";

      // для телефонов во внутренней АТС используется знак тире в
      // логине, тогда телефоном будет всё, что после тире
      if (fromPhone.IndexOf("-") > 0) {
        fromPhone = fromPhone.Substring(fromPhone.IndexOf("-") + 1);
      }

      data = "format=json&from=" + fromPhone + "&to=" + toPhone;
      
      res = SendWebRequest(url, data, "Authorization", GetAutorizationHeaderForCallback_Zadarma(fromPhone, toPhone, secret_key, api_key));
      
      return Content(JsonConvert.SerializeObject(new { success = true, res = res }), "application/json");

    }

    #region Вспомогательные метоы для звонка через Zadarma
    /// <summary>
    /// Возвращает заголовок для авторизации для выполнения обратного звонка с использование сервиса Zadarma
    /// </summary>
    /// <param name="fromNumber">Номер оператора (SIP)</param>
    /// <param name="toNumber">Номер вызываемого абонента (в формате 79876543210)</param>
    /// <param name="secret_key">Секретный ключ выданный службой Zadarma</param>
    /// <param name="api_key">API ключ выданный Zadarma</param>
    /// <returns>Готовый заголовок для авторизации</returns>
    private string GetAutorizationHeaderForCallback_Zadarma(string fromNumber, string toNumber, string secret_key, string api_key)
    {
      string path = "/v1/request/callback/";
      string query_string = $"format=json&from={fromNumber}&to={toNumber}";
      var hashed = SHA1Hash(path + query_string + MD5Hash(query_string), secret_key);
      string autorization = api_key + ":" + Base64Encode(hashed);
      return autorization;
    }

    private string SHA1Hash(string instr, string secret_key)
    {
      var keyByte = Encoding.Default.GetBytes(secret_key);

      var hmacsha = new HMACSHA1(keyByte);

      hmacsha.ComputeHash(Encoding.Default.GetBytes(instr));

      return ByteToString(hmacsha.Hash).ToLower();
    }

    private string MD5Hash(string instr)
    {
      var md5 = new System.Security.Cryptography.MD5CryptoServiceProvider();

      var hash = md5.ComputeHash(Encoding.Default.GetBytes(instr));

      return ByteToString(hash).ToLower();
    }

    private string ByteToString(byte[] buff)
    {
      string sbinary = "";
      for (int i = 0; i < buff.Length; i++)
      {
        sbinary += buff[i].ToString("X2");
      }
      return sbinary;
    }

    private string Base64Encode(string plainText)
    {
      var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
      return System.Convert.ToBase64String(plainTextBytes);
    }
    #endregion Вспомогательные метоы для звонка через Zadarma

    public ActionResult Nastr() {
      return View();
    }

    // получить настройки салона
    [HttpGet]
    public ActionResult GetNastrData() {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = db.O_NASTR.Where(x => x.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();
        
        if (d != null) {
          d.SMS_PASSWORD = null;
        }

        return Content(JsonConvert.SerializeObject(d), "application/json");
      }
    }

    // сохранение настройки салона
    [HttpPost]
    public ActionResult SaveNastrData(O_NASTR n) {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {

        if (n.ID != 0) {
          var s = db.O_NASTR.Find(n.ID);
          if (s.SMS_PASSWORD != null && n.SMS_PASSWORD == null) {
            n.SMS_PASSWORD = s.SMS_PASSWORD;
          }
          n.D_MODIF = CreateDate();
          n.USERID = uc.ID;
          n.M_ORG_ID = uc.M_ORG_ID;
          db.Entry(s).CurrentValues.SetValues(n);
        } else {
          n.D_START = CreateDate();
          n.USERID = uc.ID;
          n.M_ORG_ID = uc.M_ORG_ID;

          if (n.SHOW_KONT == 0) {
            n.SHOW_KONT = 1;
          }

          if (n.VNESH_VID_REG == null) {
            n.VNESH_VID_REG = VNESH_VID_REG_SO_SPISKOM_MEST;
          }

          db.O_NASTR.Add(n);
        }

        db.SaveChanges();

        return Content(JsonConvert.SerializeObject(new {success = true}), "application/json");
      }
    }


    // получить данные для режима Отчеты - Продажи
    [HttpGet]
    public ActionResult GetReportProdaji(DateTime? date0, DateTime? date1) {

      if (!date0.HasValue || !date1.HasValue) {
        return Content(JsonConvert.SerializeObject(new {error = "Не заданы даты периода"}), "application/json");
      }

      UserContext uc = GetUserContext();

      // избавляюсь от разницы +4 часа
      date0 = DateTimeToUniversalTime(date0);
      date1 = DateTimeToUniversalTime(date1);

      DateTime d0 = new DateTime(date0.Value.Year, date0.Value.Month, date0.Value.Day, 0, 0, 0);
      DateTime d1 = new DateTime(date1.Value.Year, date1.Value.Month, date1.Value.Day, 0, 0, 0);

      using (ATLANTEntities db = new ATLANTEntities()) {
        SqlParameter pMOrgId = new SqlParameter("@m_org_id", uc.M_ORG_ID);
        pMOrgId.SqlDbType = SqlDbType.Int;

        SqlParameter pDate0 = new SqlParameter("@date0", d0);
        pDate0.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter pDate1 = new SqlParameter("@date1", d1);
        pDate1.SqlDbType = SqlDbType.SmallDateTime;

        var d = db.Database.SqlQuery<ReportSalesData>("EXEC [dbo].[GET_REPORT_SALES] @date0 = @date0, @date1 = @date1, @m_org_id = @m_org_id",
                                                      pDate0, pDate1, pMOrgId);

        return Content(JsonConvert.SerializeObject(d), "application/json");
      }
    }

    // получить данные для отчета Карта
    [HttpGet]
    //#379 Формируем карту из режима Дилер А и С
    public ActionResult GetReportKarta(DateTime? fromDate, DateTime? toDate, int? M_ORG_ID) {

      // избавляемся от разницы +4 часа
      fromDate = fromDate.Value.ToUniversalTime();
      toDate = toDate.Value.ToUniversalTime();

      // исправляем время
      fromDate = new DateTime(fromDate.Value.Year, fromDate.Value.Month, fromDate.Value.Day, 0, 0, 0);
      toDate = new DateTime(toDate.Value.Year, toDate.Value.Month, toDate.Value.Day, 23, 59, 59);

      // статус по людям отображенным на крате
      List<KartaStatusViewModel> status = new List<KartaStatusViewModel>();

      // получить долготу и широту точки по текстовому адресу
      Func<string, decimal[]> GetCoords = (s) => {

        decimal[] ar = new decimal[2];
        string stringCoords = SendWebRequest("https://geocode-maps.yandex.ru/1.x/","format=json&geocode=" + s);
        dynamic o = JsonConvert.DeserializeObject(stringCoords);

        string pos = o.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos;
        string[] coord = pos.Split(' ');

        Thread.CurrentThread.CurrentCulture = new CultureInfo("en-GB");
        ar[0] = Decimal.Parse(coord[0]);
        ar[1] = Decimal.Parse(coord[1]);

        return ar;

      };


      UserContext uc = GetUserContext();
      // #379 Если передали головную организацию
      using (ATLANTEntities db = new ATLANTEntities()) {

        List<int> all = new List<int>();

        if (M_ORG_ID.HasValue) {
          int m_org_type_id = db.M_ORG.Find(M_ORG_ID).M_ORG_TYPE_ID.Value;

          // если это дилер A
          if (m_org_type_id == M_ORG_TYPE_ID_DILER_A) {

            // салоны C
            var listC = db.M_ORG.Where(x => x.PARENT_ID == M_ORG_ID);

            // салоны D
            var listD = db.M_ORG.Where(x => listC.Any(y => x.PARENT_ID == y.ID));

            foreach(var m in listC.Union(listD).ToList()) {
              all.Add(m.ID);
            }

            // если Дилер C
          } else if (m_org_type_id == M_ORG_TYPE_ID_DILER_C) {

            // у дилера C могуть быть только салоны дилера D в подчинении,
            // и только непосредственно дочерними
            var listD = db.M_ORG.Where(x => x.PARENT_ID == M_ORG_ID).ToList();

            foreach (var m in listD) {
              all.Add(m.ID);
            }

          } else {
            return HttpNotFound("Недопустимый тип дилера, должен быть Дилер A или Дилер C! M_ORG_ID = " + M_ORG_ID);
          }
        } else {
          all.Add(uc.M_ORG_ID);        
        }

        var ankQ = db.O_ANK.Where(x => all.Contains(x.M_ORG_ID.Value) &&
                                       // адрес задан
                                       x.CITY != null && x.STREET != null && x.HOUSE != null &&
                                       // #352 анкеты созданы в указанный период
                                       x.DATE_REG >= fromDate &&
                                       x.DATE_REG <= toDate);

        // проживают всего
        int semyaVsego = db.O_SKLAD_RAS.Where(x => ankQ.Any(y => y.ID == x.O_ANK_ID)).Sum(x => x.SEMYA_VSEGO) ?? 0;
        status.Add(new KartaStatusViewModel {kolvo = semyaVsego, name = "чел. проживают с посетителем"});


        // продажи
        var prodaji = db.O_SKLAD_RAS_PRODUCT.Where(y => y.M_ORG_ID == uc.M_ORG_ID &&
                                                        y.OPL_OST == 0 && y.COST > 0 /* отсекаем подарки */ &&
                                                        // #352 выданы в указанный период
                                                        y.D_VID >= fromDate &&
                                                        y.D_VID <= toDate &&
                                                        y.IS_VID == 1);

        var pro = prodaji.ToList();

        // совершено продаж
        int prodajiCount = prodaji.Sum(x => x.KOLVO) ?? 0;
        status.Add(new KartaStatusViewModel {kolvo = prodajiCount, name = "совершено продаж"});

        // продажи по группам товаров
        var prodajiGroup = prodaji
                           .GroupBy(x => x.M_PRODUCT_ID)
                           .Select(x => new {m_product_id = x.Key, kolvo = x.Sum(y => y.KOLVO)})
                           .Join(db.M_PRODUCT, pr => pr.m_product_id, m => m.ID, (pr, m) => new {m.NAME, pr.kolvo}).ToList();
        
        prodajiGroup.ForEach(x => {
          status.Add(new KartaStatusViewModel {kolvo = x.kolvo ?? 0, name = x.NAME});
        });

        var ank = ankQ.ToList();

        // всего людей
        var vsegoLyudey = ank.Count();
        status.Add(new KartaStatusViewModel {kolvo = vsegoLyudey, name = "всего людей"});

        // сколько знают всего
        // не знаю откуда брать, пока возьму что-нибудь
        var znayutVsego = semyaVsego;
        status.Add(new KartaStatusViewModel {kolvo = semyaVsego, name = "сколько знают всего"});

        // делаю запрос и если что-то пошло не так, то возвращаю ошибку
        // и пропускаю такие записи
        var r = ank.Select(x => {

          try {

            KartaViewModel kv = new KartaViewModel();

            // координаты уже могли вычисляться
            if (x.GPS_LT != null && x.GPS_LG != null) {

              kv.lt = x.GPS_LT;
              kv.lg = x.GPS_LG;

            } else {

              decimal[] coords = GetCoords(x.CITY + "+" + x.STREET + "+" + x.HOUSE + (x.CORPUS ?? ""));
              kv.lt = coords[0];
              kv.lg = coords[1];
              
              // сохраняю полученные координаты, чтобы каждый раз не переполучать
              // если адрес изменится, координаты обнулятся
              x.GPS_LT = kv.lt;
              x.GPS_LG = kv.lg;
              db.SaveChanges();

            }
            
            // количество приобретённых продуктов
            kv.kolvo = db.O_SKLAD_RAS.Where(y => y.O_ANK_ID == x.ID)
                       .Join(db.O_SKLAD_RAS_PRODUCT, ras => ras.ID, prod => prod.O_SKLAD_RAS_ID, (ras, prod) => prod)
                       .Where(y => y.OPL_OST == 0 && 
                                   y.COST > 0 && /* отсекаю подарки */
                                   // #352 выданы в указанный период
                                   y.D_VID >= fromDate &&
                                   y.D_VID <= toDate &&
                                   y.IS_VID == 1)
                       .Sum(y => y.KOLVO) ?? 0 ;

            kv.error = false;

            return kv;

          } catch {

            return new KartaViewModel {error = true};

          }

        })

        // пропускаю записи с ошибкой
        .Where(x => x.error == false)
        .OrderBy(x => x.lg);

        // координаты офиса
        KartaViewModel kvOffice;
        try {
          decimal[] coords = GetCoords(Uri.EscapeUriString(uc.M_ORG_ADRES));
          kvOffice = new KartaViewModel {
            error = false,
            kolvo = r.Sum(x => x.kolvo),
            lt = coords[0],
            lg = coords[1]
          };
        } catch {
          kvOffice = new KartaViewModel {
            error = true
          };
        }

        return Content(JsonConvert.SerializeObject(new {klienti = r, office = kvOffice, status = status}),
             "application/json");
        
      }
      

      /*
      return Content(JsonConvert.SerializeObject(new [] {
        new {lg = 53.114925, lt = 50.076424, kolvo = 2},
        new {lg = 53.214925, lt = 50.176424, kolvo = 3}}
      ), "application/json");

      */


    }

    public ActionResult GetStatusClients(BazaListParams p)
    {
      // запрашиваем список из базы
      p.page = 1;
      List<BazaListViewModel> bazalist = GetBazaListData(p, ROWS_PER_PAGE_BAZA_ALL);

      if (bazalist.Count > 0)
      {
        UserContext uc = GetUserContext();

        using (ATLANTEntities db = new ATLANTEntities())
        {

          BazaLeftBarViewModel leftBarResult = new BazaLeftBarViewModel();
          var statList = db.O_STATUS.Where(x => x.M_ORG_ID == uc.M_ORG_ID).ToList();
          #region Формирования статусов
          //подсчитываем количество людей по статусам
          var list = (from c in bazalist
                      from b in statList
                      where c.id == b.O_ANK_ID
                      group b by b.M_STATUS_ID into g
                      orderby g.Count()
                      select new
                      {
                        M_STATUS_ID = g.Key,
                        COUNT = g.Count()
                      }).ToList();

          var result = new Dictionary<int,StatusClientViewModel>();
          list.Reverse();
          foreach (var item in list) {
            if (item.COUNT == 0) {
              continue;
            }
            var newResultItem = new StatusClientViewModel();
            newResultItem.M_STATUS_ID = item.M_STATUS_ID.Value;
            newResultItem.COUNT_ANK = item.COUNT;

            result.Add(newResultItem.M_STATUS_ID,newResultItem);
          }

          foreach (var stat in db.M_STATUS) {
            StatusClientViewModel existItem = null;
            //раньше добавляли 0-вые статусы, теперь такой необзодимсоти нет
            //if (result.TryGetValue(stat.ID, out existItem) == false)
            //{
            //  existItem = new StatusClientViewModel();
            //  existItem.M_STATUS_ID = stat.ID;
            //  existItem.COUNT_ANK = 0;
            //  result.Add(stat.ID, existItem);
            //}
            if (result.TryGetValue(stat.ID, out existItem)) {
              existItem.M_STATUS_NAME = stat.NAME;
            }
          }

          #endregion формирования статусов

          leftBarResult.Statuses = result.Values.ToList();

          #region Подсчет дней рождений
          //получаем текущую дату
          DateTime currentDay = CreateDate().Date;

          //получаем список дней рождений
          var listBirthday = (from b in bazalist
                              where b.birthday != null
                              select new {
                                ANK_ID = b.id,
                                BIRTHDAY = b.birthday.Value.AddYears((currentDay.Year - b.birthday.Value.Year))
                                //идем на хитрость, для упрощения сравнения, дату дней рождений смещаем в текущий год
                              }).ToList();

          //определяем дату начала недели
          DateTime startWeek = currentDay;
          while (startWeek.DayOfWeek != DayOfWeek.Monday) {
            startWeek = startWeek.AddDays(-1);
          }

          //определяем дату окончания недели
          DateTime endWeek = currentDay;
          while (endWeek.DayOfWeek != DayOfWeek.Sunday) {
            endWeek = endWeek.AddDays(1);
          }

          //выплняе подсчет дней рождений
          int countCurDate = 0;
          int countCurWeek = 0;
          int countCurMonth = 0;
          foreach (var item in listBirthday) {
            if (item.BIRTHDAY == currentDay) {
              countCurDate++;
            }

            if (startWeek <= item.BIRTHDAY && item.BIRTHDAY <= endWeek) {
              countCurWeek++;
            }

            if (item.BIRTHDAY.Month == currentDay.Month) {
              countCurMonth++;
            }
          }

          #endregion Подсчет дней рождений
         
          leftBarResult.Birthday = new BirthdayReportViewModel() {
            ThisMonth = countCurMonth,
            ThisWeek = countCurWeek,
            Today = countCurDate
          };

          #region Товары
          //предварительно собираем ID анкет для отсечения
          List<int> existIds = bazalist.Select(b => b.id).ToList();

          var countTovarTable = (from pp in db.O_SKLAD_RAS_PRODUCT    //для получения информации о статусе товара
                           from r in db.O_SKLAD_RAS     //для получения инфрмации о покупателе
                           where pp.O_SKLAD_RAS_ID == r.ID &&
                                pp.M_ORG_ID == uc.M_ORG_ID &&
                                pp.OPL_OST == 0 &&
                                pp.COST > 0 &&
                               existIds.Contains(r.O_ANK_ID.Value)
                           group pp by pp.M_PRODUCT_ID into rr    //групперуем по ID товара
                           select new
                           {
                             M_PRODUCT_ID = rr.Key,
                             COUNT = rr.Count()
                           }).ToList();
          leftBarResult.Tovars = new List<TovarStatusViewModel>();
          foreach (var item in countTovarTable) {
            if (item.COUNT == 0) {
              continue;
            }
            TovarStatusViewModel newItem = new TovarStatusViewModel();
            newItem.COUNT = item.COUNT;
            newItem.TOVAR_ID = item.M_PRODUCT_ID.Value;
            newItem.TOVAR_NAME = db.M_PRODUCT.FirstOrDefault(t => t.ID == item.M_PRODUCT_ID)?.NAME; //имя выставляем только если товар найден
            leftBarResult.Tovars.Add(newItem);
          }

          #endregion Товары

          #region Улучшения, Пол

          leftBarResult.Uluch = new List<UluchStatusViewModel>();
          DateTime tmp = CreateDate();
          DateTime nowd = new DateTime(tmp.Year, tmp.Month, tmp.Day, 0, 0, 0);
          DateTime tomd = new DateTime(tmp.Year, tmp.Month, tmp.Day, 0, 0, 0);
          tomd.AddDays(1);

          UluchStatusViewModel nowList = new UluchStatusViewModel() {
            DAY_ID = 1,
            DAY_NAME = "Сегодня",
            COUNT = 0
          };

          UluchStatusViewModel tomList = new UluchStatusViewModel() {
            DAY_ID = 2,
            DAY_NAME = "Завтра",
            COUNT = 0
          };

          // пол
          leftBarResult.Sex = new List<SexStatusViewModel>();

          SexStatusViewModel sexNull = new SexStatusViewModel() {
            SEX_ID = 0,
            SEX_NAME = "Не указан",
            COUNT = 0
          };

          SexStatusViewModel sexMale = new SexStatusViewModel() {
            SEX_ID = 1,
            SEX_NAME = "Мужчина",
            COUNT = 0
          };

          SexStatusViewModel sexFemale = new SexStatusViewModel() {
            SEX_ID = 2,
            SEX_NAME = "Женщина",
            COUNT = 0
          };

          foreach (var bl in bazalist) {
            if (bl.uluch_day_id == nowList.DAY_ID) {
              nowList.COUNT++;
            }

            if (bl.uluch_day_id == tomList.DAY_ID) {
              tomList.COUNT++;
            }

            switch (bl.sex) {
              case null:
                sexNull.COUNT++;
                break;
              case 1:
                sexMale.COUNT++;
                break;
              case 2:
                sexFemale.COUNT++;
                break;
              default:
                break;
            }
          }

          // улучшения
          if (nowList.COUNT > 0) {
            leftBarResult.Uluch.Add(nowList);
          }

          if (tomList.COUNT > 0) {
            leftBarResult.Uluch.Add(tomList);
          }

          // пол
          if (sexNull.COUNT > 0) {
            leftBarResult.Sex.Add(sexNull);
          }

          if (sexMale.COUNT > 0) {
            leftBarResult.Sex.Add(sexMale);
          }

          if (sexFemale.COUNT > 0) {
            leftBarResult.Sex.Add(sexFemale);
          }

          #endregion Улучшения, Пол

          return Content(JsonConvert.SerializeObject(leftBarResult), "application/json");
        }
      }
      else
      {
        using (ATLANTEntities db = new ATLANTEntities())
        {
          var result = (from s in db.M_STATUS
                       select new StatusClientViewModel()
                       {
                         M_STATUS_ID = s.ID,
                         M_STATUS_NAME = s.NAME,
                         COUNT_ANK = 0
                       }).ToList();

          BazaLeftBarViewModel leftBarResult = new BazaLeftBarViewModel();
          leftBarResult.Statuses = result;
          leftBarResult.Birthday = new BirthdayReportViewModel();
          return Content(JsonConvert.SerializeObject(leftBarResult), "application/json");
        }
      }
    }

    public ActionResult Jurnal() {
      return View();
    }

    public ActionResult JurnalDeistv() {
      return View();
    }

    public ActionResult GetDeistvData(DeistvListParams p) {
      UserContext uc = GetUserContext();

      if (p.date_from.HasValue) {
        p.date_from = p.date_from.Value.ToUniversalTime();
      } else {
        p.date_from = CreateDate();
      }

      if (p.date_to.HasValue) {
        p.date_to = p.date_to.Value.ToUniversalTime();
      } else {
        p.date_to = CreateDate();
      }

      DateTime d0 = p.date_from.Value;
      DateTime d1 = p.date_to.Value;

      // смещаем время
      d1 = p.date_to.Value.AddDays(1);
      d0 = new DateTime(d0.Year, d0.Month, d0.Day, 0, 0, 0);
      d1 = new DateTime(d1.Year, d1.Month, d1.Day, 0, 0, 0);

      using (ATLANTEntities db = new ATLANTEntities()) {
        var a = db.O_DEISTV.Where(x => 
                                 (x.M_ORG_ID == uc.M_ORG_ID) &&
                                 (p.s_user_id == null || x.USERID == p.s_user_id) &&
                                 (p.m_deistv_id == null || x.M_DEISTV_ID == p.m_deistv_id) &&
                                 (DbFunctions.TruncateTime(x.D_START) >= d0 && DbFunctions.TruncateTime(x.D_START) < d1) &&
                                 (p.substr == null || x.MESS.Contains(p.substr)) &&
                                 (x.D_FIN == null)).ToList();

        return Content(JsonConvert.SerializeObject(a), "application/json");
      }
    }

    // сохраняет действие в БД
    public void SaveDeistv(O_DEISTV o) {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        
        o.D_START = CreateDate();
        o.M_ORG_ID = uc.M_ORG_ID;
        o.USERID = uc.ID;
        db.O_DEISTV.Add(o);

        // удаляем логически записи старше двух месяцев
        DateTime d0 = CreateDate();
        d0 = d0.AddMonths(-2);
        d0 = new DateTime(d0.Year, d0.Month, d0.Day, 0, 0, 0);

        foreach (var e in db.O_DEISTV.Where(x => x.M_ORG_ID == uc.M_ORG_ID && x.D_START <= d0 && x.D_FIN == null)) {
          e.D_FIN = CreateDate();
        }

        db.SaveChanges();
      }
    }





    #region Уведомления

    // получить список комментариев для групповых уведомлений
    private List<O_UVEDOML_GR_COMMENTViewModel> ExecGET_O_UVEDOML_GR_COMMENT_VIEW_MODEL(int gr, ATLANTEntities db) {

      SqlParameter pGr = new SqlParameter("@gr", gr);
      pGr.SqlDbType = SqlDbType.Int;

      return db.Database.SqlQuery<O_UVEDOML_GR_COMMENTViewModel>("exec dbo.GET_O_UVEDOML_GR_COMMENT_VIEW_MODEL @gr = @gr", pGr).ToList();

    }



    [HttpGet]
    public ActionResult GetUvedomsByDate(DateTime? date, int offset) {
      UserContext uc = GetUserContext();
      DateTime now = CreateDate();
      string fio = "";
      int id = 0;
      date = DateTimeToUniversalTime(date);
      List<UvedomnDateViewModel> tempTable = CreateDatesForUvedoml(offset);
      UvedomnDateViewModel finditem = tempTable.FirstOrDefault(t => t.Date.Date == date.Value.Date);

      if(finditem != null) {
        finditem.Selected = true;
      }

      var result = new UvedomlViewModel();
      result.Dates = tempTable.ToArray();
      result.LoadData = true;

      var dayOfWeek = date.Value.DayOfWeek;

      // дата начала выбранной недели
      DateTime fromDateLoadData = date.Value;
      fromDateLoadData = fromDateLoadData.Date;

      while(fromDateLoadData.DayOfWeek != DayOfWeek.Monday) {
        fromDateLoadData = fromDateLoadData.AddDays(-1);
      }

      // дата окончания выбранной недели
      DateTime toDateLoadData = fromDateLoadData.AddDays(6);

      var headers = new List<UvedomnDayDetailsViewModel>();

      for(DateTime counterDate = fromDateLoadData;counterDate <= toDateLoadData;counterDate = counterDate.AddDays(1)) {
        var newHeader = new UvedomnDayDetailsViewModel();
        newHeader.Date = counterDate;
        newHeader.Selected = (counterDate == date.Value.Date);

        headers.Add(newHeader);
      }

      result.HeadersDate = headers.ToArray();

      var dictiondaryForData = new Dictionary<DateTime,List<UvedomlItemViewModel>>();
      int maxLength = 0;

      for(DateTime curdate = fromDateLoadData;curdate <= toDateLoadData;curdate = curdate.AddDays(1)) {
        dictiondaryForData.Add(curdate,new List<UvedomlItemViewModel>());
      }

      using(ATLANTEntities db = new ATLANTEntities()) {
        List<O_UVEDOML> udedomls = db.O_UVEDOML.Where(
          u => u.M_ORG_ID == uc.M_ORG_ID
            && fromDateLoadData <= u.D_SOB
            && u.D_SOB <= toDateLoadData
            ).ToList();

        result.CountUvedomlInShownWeek = udedomls.Count;
        var mVidSob = db.M_VID_SOB.ToList();

        foreach(var uved in udedomls) {
          // чтобы не падало с ошибкой, если пользователь не заполнен
          fio = "";
          id = 0;
          var createdUser = db.S_USER.FirstOrDefault(u => u.ID == uved.USERID.Value);
          if (createdUser != null) {
            fio = (createdUser.SURNAME ?? "") + " " + (createdUser.NAME ?? "") + " " + (createdUser.SECNAME ?? "");
            id = createdUser.ID;
          }

          List<UvedomlItemViewModel> coolectionForAdd;

          var uvedVidName = mVidSob.FirstOrDefault(u => u.ID == uved.M_VID_SOB_ID).NAME;
          
          if(dictiondaryForData.TryGetValue(uved.D_SOB.Value.Date,out coolectionForAdd)) {

            UvedomlItemViewModel newUvedVM = new UvedomlItemViewModel() {
              Uvedoml_ID = uved.ID,
              M_VID_SOB_ID = uved.M_VID_SOB_ID.Value,
              FIO = uved.FIO,
              Phone = uved.PHONE,
              Date = uved.D_SOB.Value.Date,
              IsShown = true,
              IsCall = uved.M_VID_SOB_ID.Value == 1,
              IsPerform = uved.ISP == 1,
              UserID = id,
              Comment = uved.COMMENT,
              UserName = fio,
              ANK_ID = uved.O_ANK_ID,
              M_VID_SOB_ID_NAME = (uvedVidName ?? ""),
              GR = uved.GR,
              GR_COMMENT_LIST = ExecGET_O_UVEDOML_GR_COMMENT_VIEW_MODEL(gr: uved.GR, db: db),
              O_SKLAD_RAS_ID = uved.O_SKLAD_RAS_ID,
              O_KONT_ANK_ID = uved.O_KONT_ANK_ID
            };

            // фамилия берётся из анкеты или непосредственно из поля,
            // если поле не заполнено, то беру из анкеты
            if (String.IsNullOrEmpty(newUvedVM.FIO)) {
              var ank1 = db.O_ANK.Find(newUvedVM.ANK_ID);
              if (ank1 != null) {
                newUvedVM.FIO = (ank1.SURNAME ?? "") + " " + (ank1.NAME ?? "") + " " + (ank1.SECNAME ?? "");
              } else {
                var kont = db.O_KONT_ANK.Where(x => x.ID == uved.O_KONT_ANK_ID && x.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();

                if (kont != null) {
                  newUvedVM.FIO = (kont.SURNAME ?? "") + " " + (kont.NAME ?? "") + " " + (kont.SECNAME ?? "");
                } else {
                  newUvedVM.FIO = "";
                }
              }
            }

            coolectionForAdd.Add(newUvedVM);
            if(coolectionForAdd.Count > maxLength) {
              maxLength = coolectionForAdd.Count;
            }
          }
        }

        result.Data = new UvedomlItemViewModel[maxLength,7];
        for(int i = 0;i < maxLength;i++) {
          for(int j = 0;j < 7;j++) {
            if(dictiondaryForData[fromDateLoadData.AddDays(j)].Count() > i) {
              result.Data[i,j] = dictiondaryForData[fromDateLoadData.AddDays(j)].ElementAt(i);
            } else {
              result.Data[i,j] = new UvedomlItemViewModel() {
                Date = fromDateLoadData.AddDays(j),
                IsShown = false
              };
            }
          }
        }

      }

      return Content(JsonConvert.SerializeObject(result),"application/json");

    }



    // запросить Не выполненные или выполненные уведомления
    //      page - номер страницы, данны для которой надо переполучить
    //      isp - 0 - Не выполненные, 1 - Выполненные
    //      return_only_cnt - 1 - возвращает только количество строк, без данных
    private List<UvedomlItemViewModel> execGET_UVEDOML_ISP_OR_NOT_ISP(int page, int isp, int return_only_cnt) {


      const int ROWS_PER_PAGE = 10;

      using (ATLANTEntities db = new ATLANTEntities()) {

        SqlParameter m_org_id = new SqlParameter("@m_org_id", GetUserContext().M_ORG_ID);
        m_org_id.SqlDbType = SqlDbType.Int;

        SqlParameter param_page = new SqlParameter("@page",page);
        param_page.SqlDbType = SqlDbType.Int;

        SqlParameter param_rows_per_page = new SqlParameter("@rows_per_page", ROWS_PER_PAGE);
        param_rows_per_page.SqlDbType = SqlDbType.Int;

        SqlParameter pIsp = new SqlParameter("@isp", isp);
        pIsp.SqlDbType = SqlDbType.Int;

        SqlParameter pReturn_only_cnt = new SqlParameter("@return_only_cnt", return_only_cnt);
        pReturn_only_cnt.SqlDbType = SqlDbType.Int;


        var r = db.Database.SqlQuery<UvedomlItemViewModel>("exec dbo.[GET_UVEDOML_ISP_OR_NOT_ISP] @m_org_id = @m_org_id, @page = @page, @rows_per_page = @rows_per_page, @isp = @isp, @return_only_cnt = @return_only_cnt", m_org_id, param_page, param_rows_per_page, pIsp, pReturn_only_cnt).ToList();

        // комментарии для групповых уведомлений
        foreach(var item in r.Where(x => x.GR > 0)) {
          item.GR_COMMENT_LIST = ExecGET_O_UVEDOML_GR_COMMENT_VIEW_MODEL(gr: item.GR, db: db);
        }

        return r;

      }

    }






    // запросить Запланированные уведомления
    //      page - номер страницы, данны для которой надо переполучить
    //      return_only_cnt - 1 - возвращает только количество строк, без данных
    private List<UvedomlItemViewModel> execGET_UVEDOML_ZAPLAN(int page, int return_only_cnt) {


      const int ROWS_PER_PAGE = 10;

      using (ATLANTEntities db = new ATLANTEntities()) {

        SqlParameter m_org_id = new SqlParameter("@m_org_id", GetUserContext().M_ORG_ID);
        m_org_id.SqlDbType = SqlDbType.Int;

        SqlParameter param_page = new SqlParameter("@page",page);
        param_page.SqlDbType = SqlDbType.Int;

        SqlParameter param_rows_per_page = new SqlParameter("@rows_per_page", ROWS_PER_PAGE);
        param_rows_per_page.SqlDbType = SqlDbType.Int;

        SqlParameter pReturn_only_cnt = new SqlParameter("@return_only_cnt", return_only_cnt);
        pReturn_only_cnt.SqlDbType = SqlDbType.Int;


        var r = db.Database.SqlQuery<UvedomlItemViewModel>("exec dbo.[GET_UVEDOML_ZAPLAN] @m_org_id = @m_org_id, @page = @page, @rows_per_page = @rows_per_page, @return_only_cnt = @return_only_cnt", m_org_id, param_page, param_rows_per_page, pReturn_only_cnt).ToList();

        // комментарии для групповых уведомлений
        foreach(var item in r.Where(x => x.GR > 0)) {
          item.GR_COMMENT_LIST = ExecGET_O_UVEDOML_GR_COMMENT_VIEW_MODEL(gr: item.GR, db: db);
        }

        return r;

      }

    }




    // получить Запланированные уведомления
    //      page - номер страницы, данны для которой надо переполучить
    //      return_only_cnt - 1 - возвращает только количество строк, без данных
    public ActionResult GetUvedomlZaplan(int page, int return_only_cnt) {

      const int ROWS_PER_PAGE = 10;

      using (ATLANTEntities db = new ATLANTEntities()) {

        var r = execGET_UVEDOML_ZAPLAN(page: page, return_only_cnt: return_only_cnt);

        int count_all = 0;
        int totalPageCount = 0;
        if(r.Count != 0) {
          count_all = r.First().COUNT_ALL;
          totalPageCount = count_all / ROWS_PER_PAGE;
          if(count_all % ROWS_PER_PAGE != 0) {
            totalPageCount += 1;
          }
        }

        return Content(JsonConvert.SerializeObject(new {
            uvedomlList = r,
            TotalPageCount = totalPageCount,
            CountAll = count_all
          }), "application/json");

      }

    }


    // получить Не выполненные или Выполненные уведомления
    //      page - номер страницы, данны для которой надо переполучить
    //      isp - 0 - Не выполненные, 1 - Выполненные
    //      return_only_cnt - 1 - возвращает только количество строк, без данных
    public ActionResult GetUvedomlIspOrNotIsp(int page, int isp, int return_only_cnt) {

      const int ROWS_PER_PAGE = 10;

      using (ATLANTEntities db = new ATLANTEntities()) {

        var r = execGET_UVEDOML_ISP_OR_NOT_ISP(page: page, isp: isp, return_only_cnt: return_only_cnt);

        int count_all = 0;
        int totalPageCount = 0;
        if(r.Count != 0) {
          count_all = r.First().COUNT_ALL;
          totalPageCount = count_all / ROWS_PER_PAGE;
          if(count_all % ROWS_PER_PAGE != 0) {
            totalPageCount += 1;
          }
        }

        return Content(JsonConvert.SerializeObject(new {
            uvedomlList = r,
            TotalPageCount = totalPageCount,
            CountAll = count_all
          }), "application/json");

      }
    
    }



    /// <summary>
    /// Помечает уведомление как выполненное
    /// </summary>
    /// <param name="uvedoml"></param>
    /// <returns></returns>
    [HttpPost]
    public JsonResult PerformUvedoml(UvedomlItemViewModel uvedoml)
    {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities())
      {
        var updatedUvedoml = db.O_UVEDOML.FirstOrDefault(k => k.ID == uvedoml.Uvedoml_ID);

        if (updatedUvedoml != null)
        {
          updatedUvedoml.ISP = 1;
        }
        
        db.SaveChanges();
      }
      return Json(new { success = "true" });
    }

    /// <summary>
    /// Создает таблицы с датами для уведомлений
    /// </summary>
    /// <returns></returns>
    private List<UvedomnDateViewModel> CreateDatesForUvedoml(int offset)
    {
      DateTime currentDate = CreateDate().AddMonths(offset);

      DateTime firstDayCurrentMonth = currentDate.AddDays((currentDate.Day - 1) * (-1));
      firstDayCurrentMonth = firstDayCurrentMonth.Date;
      DateTime firstDayPrevMonth = firstDayCurrentMonth.AddMonths(-1);

      DateTime dateStartInterval = firstDayPrevMonth.AddDays((firstDayCurrentMonth - firstDayPrevMonth).Days / 2);

      DateTime firstDayNextMonth = firstDayCurrentMonth.AddMonths(1);
      DateTime lastDatNextMonth = firstDayNextMonth.AddMonths(1).AddDays(-1);

      DateTime dateEndInterval = firstDayNextMonth.AddDays((lastDatNextMonth - firstDayNextMonth).Days / 2);

      var uvedomlDates = new List<UvedomnDateViewModel>();



       SqlParameter m_org_id = new SqlParameter("@m_org_id", GetUserContext().M_ORG_ID);
        m_org_id.SqlDbType = SqlDbType.Int;


        SqlParameter startDate = new SqlParameter("@startDate", dateStartInterval);
        startDate.SqlDbType = SqlDbType.DateTime;

        SqlParameter endDate = new SqlParameter("@endDate", dateEndInterval);
        endDate.SqlDbType = SqlDbType.DateTime;

      List < DateCountUvedomlViewModel > countByDay = null;
      using (ATLANTEntities db = new ATLANTEntities())
      {
        countByDay = db.Database.SqlQuery<DateCountUvedomlViewModel>("exec [dbo].[GET_UVEDOML_COUNT_BY_DATE] @m_org_id = @m_org_id,  @startDate = @startDate , @endDate = @endDate", m_org_id, startDate, endDate).ToList();
      }



      for (DateTime date = dateStartInterval; date <= dateEndInterval; date = date.AddDays(1))
      {
        var newItem = new UvedomnDateViewModel();
        newItem.Date = date;
        if (date < firstDayCurrentMonth)
        {
          newItem.PrevMonth = true;
        }
        else if (date >= firstDayNextMonth)
        {
          newItem.NextMonth = true;
        }
        else
        {
          newItem.CurrentMonth = true;
        }

        if (date.DayOfWeek == DayOfWeek.Saturday
            || date.DayOfWeek == DayOfWeek.Sunday)
        {
          newItem.Weekend = true;
        }

        var currentCountUvedoml = countByDay.FirstOrDefault(c => c.D_SOB == date);
        if (currentCountUvedoml != null)
        {
          newItem.CountUvedoml = currentCountUvedoml.CountUvedoml;
        }
        else
        {
          newItem.NotExistUvedoml = true;
        }

        // помечаем 1-е число, для отображения месяца и года, как на слайде
        if (newItem.Date.Day == 1) {
          newItem.FirstMonthDay = 1;
          newItem.MonthName = arrayMonthKr[newItem.Date.Month - 1];
          newItem.Year = newItem.Date.Year;
        } else {
          newItem.FirstMonthDay = 0;
        }

        uvedomlDates.Add(newItem);
      }

      return uvedomlDates;
    }

    /// <summary>
    /// Выполняет добавления уведомления
    /// </summary>
    /// <param name="surname">Фамилия</param>
    /// <param name="name">Имя</param>
    /// <param name="secname">Отчество</param>
    /// <param name="phone">Телефон</param>
    /// <param name="time_id">Идентификатор сеанса</param>
    /// <param name="date">Дата сеанса</param>
    /// <returns></returns>
    [HttpPost]
    public ActionResult CreateUvedoml(string fio, string phone, string commentForSave, int? M_VID_SOB_ID, DateTime? date) {
      string message = "";

      //получаю нехватающую для сохранения информацию
      var userContext = GetUserContext();

      if(date.HasValue) {
        date = date.Value.ToUniversalTime();
      }

      using(ATLANTEntities db = new ATLANTEntities()) {
        O_UVEDOML newUvedoml = new O_UVEDOML() {
          FIO = fio,
          PHONE = phone,
          COMMENT = commentForSave,
          M_VID_SOB_ID = M_VID_SOB_ID.Value,
          M_ORG_ID = userContext.M_ORG_ID,
          USERID = userContext.ID,
          D_START = CreateDate(),
          D_SOB = date.Value,
          ISP = 0
        };

        //нужно ли отсеивать по организации
        var existAnk = db.O_ANK.FirstOrDefault(a => a.PHONE_MOBILE == phone || a.PHONE_HOME == phone);
        if(existAnk != null) {
          newUvedoml.O_ANK_ID = existAnk.ID;

          // #365 Не храним ФИО для анкет
          newUvedoml.FIO = null;
        }

        db.O_UVEDOML.Add(newUvedoml);
        db.SaveChanges();
      }
      message = "true";
      return Json(new {
        success = message
      });
    }

    /// <summary>
    /// Выполняет изменение уведомления
    /// </summary>
    /// <returns></returns>
    [HttpPost]
    public ActionResult ChangeUvedoml(string fio, string phone, string commentForSave, 
                                      int? M_VID_SOB_ID, DateTime? date, int? uvedoml_ID,
                                      IList<O_UVEDOML_GR_COMMENTViewModel> GR_COMMENT_LIST) {
      string message = "";

      if (GR_COMMENT_LIST == null) {
       GR_COMMENT_LIST = new List<O_UVEDOML_GR_COMMENTViewModel>();
      }

      //получаю нехватающую для сохранения информацию
      UserContext uc = GetUserContext();
      DateTime now = CreateDate();

      if (date.HasValue) {
        date = date.Value.ToUniversalTime();
      }

      using (ATLANTEntities db = new ATLANTEntities()) {
        O_UVEDOML changedUvedoml = db.O_UVEDOML.FirstOrDefault(u => u.ID == uvedoml_ID.Value);

        changedUvedoml.FIO = fio;
        changedUvedoml.PHONE = phone;
        changedUvedoml.COMMENT = commentForSave;
        changedUvedoml.M_VID_SOB_ID = M_VID_SOB_ID.Value;
        changedUvedoml.M_ORG_ID = uc.M_ORG_ID;
        changedUvedoml.D_MODIF = CreateDate();
        
        //нужно ли отсеивать по организации
        var existAnk = db.O_ANK.FirstOrDefault(a => a.PHONE_MOBILE == phone || a.PHONE_HOME == phone);
        if (existAnk != null) {
          changedUvedoml.O_ANK_ID = existAnk.ID;
          // #365 Не храним ФИО для анкет
          changedUvedoml.FIO = null;
        } else {
          changedUvedoml.O_ANK_ID = null;
        }

        db.SaveChanges();

        // Сохранение комментариев для групповых уведомлений
        if (GR_COMMENT_LIST.Count > 0 ) {

          var newCommentList = GR_COMMENT_LIST.Where(x => x.ID == 0).ToList();

          if (newCommentList.Count > 0) {

            List<O_UVEDOML_GR_COMMENT> grCommentList = new List<O_UVEDOML_GR_COMMENT>();

            foreach(var item in newCommentList) {

              grCommentList.Add(new O_UVEDOML_GR_COMMENT() {
                ID = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_UVEDOML_GR_COMMENT_ID as int);").First(),
                D_START = now,
                D_MODIF = null,
                M_ORG_ID = uc.M_ORG_ID,
                USERID = uc.ID,
                O_UVEDOML_GR = item.O_UVEDOML_GR,
                O_UVEDOML_ID = item.O_UVEDOML_ID,
                COMMENT = item.COMMENT
              });

            }

            db.O_UVEDOML_GR_COMMENT.AddRange(grCommentList);
            db.SaveChanges();

          }

          // для каждого группового уведомления надо обновить основной комментарий,
          // чтобы он содержал объединение из всех комментариев по группе
          string commentAgg = "";
          // у всех группа одинаковая, беру любую
          int gr = GR_COMMENT_LIST.First().O_UVEDOML_GR.Value;
          foreach(var item in GR_COMMENT_LIST) {
            commentAgg = commentAgg + item.COMMENT + "\r\n";
          }
          var uvedomlList = db.O_UVEDOML.Where(x => x.GR == gr).ToList();

          foreach(var item in uvedomlList) {
            item.COMMENT = commentAgg;
          }

          db.SaveChanges();

        }
        // /сохранение комментариев для групповых уведомлений






      }

      message = "true";
      return Json(new { success = message });

    }

    /// <summary>
    /// Возвращает количество невыполненных уведомлений за сегодня для отображения под "колокольчиком"
    /// </summary>
    /// <returns></returns>
    [HttpGet]
    public ActionResult GetCountCurrentUvedoml()
    {
      int result = 0;
      var uc = GetUserContext();

      using (ATLANTEntities db = new ATLANTEntities()) {

        DateTime now = CreateDate();
        
        result = db.O_UVEDOML.Count(
          u => u.M_ORG_ID == uc.M_ORG_ID
            && DbFunctions.TruncateTime(u.D_SOB) == now.Date
            && u.ISP == 0);
      }

      return Content(JsonConvert.SerializeObject(result), "application/json");
    }


    #endregion Уведомления

    // удаление расхода из склада - только для админа
    public ActionResult DeleteSkladRas(int? ID) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        if (ID.HasValue) {
          foreach(var r in db.O_SKLAD_RAS.Where(x => x.ID == ID)) {
            foreach(var p in db.O_SKLAD_RAS_PRODUCT.Where(x => x.O_SKLAD_RAS_ID == r.ID)) {
              foreach (var o in db.O_SKLAD_RAS_PRODUCT_OPL.Where(x => x.O_SKLAD_RAS_PRODUCT_ID == p.ID)) {
                db.O_SKLAD_RAS_PRODUCT_OPL.Remove(o);
              }
              foreach(var u in db.O_UVEDOML.Where(x => x.O_SKLAD_RAS_ID == r.ID)) { // уведомления по продаже тоже надо удалить
                db.O_UVEDOML.Remove(u);
              }
              db.O_SKLAD_RAS_PRODUCT.Remove(p);
            }
            db.O_SKLAD_RAS.Remove(r);
          }
          db.SaveChanges();
        }
      }
      return Content(JsonConvert.SerializeObject(new { success = true }), "application/json");
    }

    public ActionResult Voprosy() {
      return View();
    }

    // получаем вопросы по анкете и по своему салону
    public ContentResult GetAnkVoprosy(int? ID) {
      UserContext uc = GetUserContext();
      int minusID = -1; // для новых записей
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = db.O_VOPROS.Where(x => x.O_ANK_ID == ID && x.M_ORG_ID == uc.M_ORG_ID).ToList();
        // нет записей
        if (d.Count == 0) {
          // вернем записи от первого внесения вопросов
          // т.е. вопросы заносят один раз в случайной анкете и они для всех одинаковы
          // если таблица пуста вернем одну запись, для ручного добавления
          var f = db.O_VOPROS.Where(x => x.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();
          if (f != null) {
            foreach(var e in db.O_VOPROS.Where(x => x.O_ANK_ID == f.O_ANK_ID && x.M_ORG_ID == uc.M_ORG_ID)) {
              e.ID = minusID;
              e.O_ANK_ID = ID;
              e.M_YES_NO_ID = 2; // нет
              e.D_MODIF = null;
              e.D_START = null;
              e.COMMENT = null;
              e.USERID = null;
              d.Add(e);
              minusID--;
            }
          } else {
            O_VOPROS v = new O_VOPROS();
            var t = db.M_VOPROS_TAB.Where(x => x.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();
            if (t != null) {
              var m = db.M_VOPROS.Where(x => x.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();
              v.M_YES_NO_ID = 1; // да
              v.M_VOPROS_TAB_ID = t.ID;
              if (m != null) {
                v.M_VOPROS_ID = m.ID;
              }
              v.O_ANK_ID = ID;
              v.ID = -1;
              d.Add(v);
            }
          }
        }
        return Content(JsonConvert.SerializeObject(d), "application/json");
      }
    }

    [HttpPost]
    public ActionResult SaveAnkVoprosy(List<M_VOPROS_TAB> t, List<O_VOPROS> v, int? o_ank_id) {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        if (t != null) {
          foreach(var x in t) {
            // новые записи на новой вкладке
            if (x.ID < 0) {
              DbRawSqlQuery<int> newIdList = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_M_VOPROS_TAB_ID as int);");
              int newId = newIdList.First();
              if (v != null) {
                foreach(var e in v) {
                  // сохраняем вопросы по текущей вкладке
                  if (e.M_VOPROS_TAB_ID == x.ID) {
                    e.M_VOPROS_TAB_ID = newId;
                    e.M_ORG_ID = uc.M_ORG_ID;
                    e.USERID = uc.ID;
                    e.D_START = CreateDate();
                    db.O_VOPROS.Add(e);
                  }
                }
              }
              x.ID = newId;
              x.M_ORG_ID = uc.M_ORG_ID;
              db.M_VOPROS_TAB.Add(x);
            }
          }

          // новые записи на уже существующей вкладке
          if (v != null) {
            foreach (var e in v) {
              if (e.M_VOPROS_TAB_ID > 0 && e.ID < 0) {
                e.M_ORG_ID = uc.M_ORG_ID;
                e.USERID = uc.ID;
                e.D_START = CreateDate();
                db.O_VOPROS.Add(e);
              } else if (e.ID > 0) {
                var a = db.O_VOPROS.Find(e.ID);
                if (a != null) {
                  e.D_MODIF = CreateDate();
                  db.Entry(a).CurrentValues.SetValues(e);
                }
              }
            }
          }

          db.SaveChanges();

          // удаляем записи, которых нет в списке из клиента
          var dbv = db.O_VOPROS.Where(x => x.O_ANK_ID == o_ank_id).ToList();
          if (dbv != null) {
            foreach(var d in dbv) {
              int exists = 0;
              foreach(var e in v) {
                if (e.ID == d.ID) {
                  exists = 1;
                }
              }
              if (exists == 0) {
                db.O_VOPROS.Remove(d);
              }
            }
            db.SaveChanges();
          }
        }
      }
      
      return Content(JsonConvert.SerializeObject(new { success = true }), "application/json");
    }

    // получить данные для режима Отчеты - Опрос
    [HttpGet]
    public ActionResult GetReportOpros(DateTime? date0, DateTime? date1) {

      if (!date0.HasValue || !date1.HasValue) {
        return Content(JsonConvert.SerializeObject(new { error = "Не заданы даты периода" }), "application/json");
      }

      UserContext uc = GetUserContext();

      // избавляюсь от разницы +4 часа
      date0 = DateTimeToUniversalTime(date0);
      date1 = DateTimeToUniversalTime(date1);

      DateTime d0 = new DateTime(date0.Value.Year, date0.Value.Month, date0.Value.Day, 0, 0, 0);
      DateTime d1 = new DateTime(date1.Value.Year, date1.Value.Month, date1.Value.Day, 0, 0, 0);

      using (ATLANTEntities db = new ATLANTEntities()) {
        SqlParameter pMOrgId = new SqlParameter("@m_org_id", uc.M_ORG_ID);
        pMOrgId.SqlDbType = SqlDbType.Int;

        SqlParameter pDate0 = new SqlParameter("@date0", d0);
        pDate0.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter pDate1 = new SqlParameter("@date1", d1);
        pDate1.SqlDbType = SqlDbType.SmallDateTime;

        var d = db.Database.SqlQuery<ReportOprosData>("EXEC [dbo].[GET_REPORT_OPROS] @date0 = @date0, @date1 = @date1, @m_org_id = @m_org_id",
                                                      pDate0, pDate1, pMOrgId);
        return Content(JsonConvert.SerializeObject(d), "application/json");
      }

    }

    public ActionResult PrintAnk(){
      return View();
    }

    // заглушка
    public ContentResult GetReportMetrika() {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        SqlParameter pMOrgId = new SqlParameter("@m_org_id", uc.M_ORG_ID);
        pMOrgId.SqlDbType = SqlDbType.Int;

        var d = db.Database.SqlQuery<ReportMetrikaData>("EXEC [dbo].[GET_REPORT_METRIKA] @m_org_id = @m_org_id", pMOrgId);
        return Content(JsonConvert.SerializeObject(d), "application/json");
      }
    }

    public ContentResult GetTehOtdelData(int? M_ORG_ID, string TEXT) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        SqlParameter pMOrgId = new SqlParameter("@m_org_id", M_ORG_ID);
        pMOrgId.SqlDbType = SqlDbType.Int;

        SqlParameter pText = new SqlParameter("@text", TEXT);
        pText.SqlDbType = SqlDbType.VarChar;

        var d = db.Database.SqlQuery<TehOtdelData>("EXEC [dbo].[GET_TEH_OTDEL_DATA] @m_org_id = @m_org_id, @text = @text", pMOrgId, pText);
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }


    // Отчёты - Маркетинг, получение доступных для выбора годов формирования отчета
    [HttpGet]
    public ActionResult GetReportMarketingYears() {

      // те же самые года, что и в режиме Учет - Отчеты - Отчет за период
      return  GetUchetReportsOtchetZaPerYears();

    }

    // Отчёты - Маркетинг, получение данных за год по месяцам, неделям и дням
    [HttpGet]
    public ActionResult GetReportMarketing(int year) {

      UserContext uc = GetUserContext();
      using(ATLANTEntities db = new ATLANTEntities()) {

        SqlParameter pM_org_id = new SqlParameter("@m_org_id", uc.M_ORG_ID);
        pM_org_id.SqlDbType = SqlDbType.Int;

        SqlParameter pYear = new SqlParameter("@year", year);
        pYear.SqlDbType = SqlDbType.Int;

        var r = db.Database.SqlQuery<GetReportMarketingYearsViewModel>(
            "exec dbo.GET_REPORT_MARKETING @m_org_id = @m_org_id, @year = @year;",
            new SqlParameter[] {pM_org_id, pYear});

        return Content(JsonConvert.SerializeObject(r), "application/json");

      }

    }

    [HttpGet]
    public ActionResult GetServiceProductPhoto(int id) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        O_SERVICE a;
        a = db.O_SERVICE.Find(id);
        if (a == null) {
          return HttpNotFound();
        }

        if (a.PRODUCT_PHOTO != null) {
          return File(a.PRODUCT_PHOTO, "image/jpg");
        } else {
          return File(System.IO.File.ReadAllBytes(Server.MapPath("~") + EMPTY_PHOTO), "image/png");
        }
      }
    }

    [HttpGet]
    public ActionResult GetServiceGuaranteePhoto(int id) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        O_SERVICE a;
        a = db.O_SERVICE.Find(id);
        if (a == null) {
          return HttpNotFound();
        }

        if (a.GUARANTEE_PHOTO != null) {
          return File(a.GUARANTEE_PHOTO, "image/jpg");
        } else {
          return File(System.IO.File.ReadAllBytes(Server.MapPath("~") + EMPTY_PHOTO), "image/png");
        }
      }
    }

    [HttpGet]
    public ActionResult GetServiceCheckPhoto(int id) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        O_SERVICE a;
        a = db.O_SERVICE.Find(id);
        if (a == null) {
          return HttpNotFound();
        }

        if (a.PRODUCT_CHECK != null) {
          return File(a.PRODUCT_CHECK, "image/jpg");
        } else {
          return File(System.IO.File.ReadAllBytes(Server.MapPath("~") + EMPTY_PHOTO), "image/png");
        }
      }
    }

    /// <summary>
    /// Формирование отчета Сервис
    /// </summary>
    /// <returns></returns>
    [HttpGet]
    public ActionResult GetReportService() {
      using (ATLANTEntities db = new ATLANTEntities()) {

        SqlParameter pMOrgId = new SqlParameter("@m_org_id", GetUserContext().M_ORG_ID);
        pMOrgId.SqlDbType = SqlDbType.Int;

        List<ReportServiceRowViewModel> reportRows = db.Database.SqlQuery<ReportServiceRowViewModel>("EXEC [dbo].[GET_REPORT_SERVICE] @m_org_id = @m_org_id", pMOrgId).ToList();

        return Content(JsonConvert.SerializeObject(reportRows), "application/json");
      }
    }

    [HttpPost]
    public ActionResult SaveTehOtdel(O_SERVICE s) {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        var t = db.O_SERVICE.Find(s.ID);
        if (t != null) {
          t.M_ORG_ID_TEH_OTDEL = uc.M_ORG_ID;
          t.S_USER_ID_TEH_OTDEL = uc.ID;
          t.M_SERVICE_TYPE_ID_TEH_OTDEL = s.M_SERVICE_TYPE_ID_TEH_OTDEL;
          t.DATE_TEH_OTDEL = DateTimeToUniversalTime(s.DATE_TEH_OTDEL);
          t.COMMENT_TEH_OTDEL = s.COMMENT_TEH_OTDEL;
        }
        db.SaveChanges();
        return Content(JsonConvert.SerializeObject(new { success = true }), "application/json");
      }
    }

    [HttpGet]
    public ActionResult GetReportItog(DateTime? fromDate, DateTime? toDate)
    {
      // избавляюсь от разницы +4 часа
      fromDate = fromDate.Value.ToUniversalTime();
      toDate = toDate.Value.ToUniversalTime();

      using (ATLANTEntities db = new ATLANTEntities())
      {
        SqlParameter p_fromDate = new SqlParameter("@fromDate", fromDate);
        p_fromDate.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter p_toDate = new SqlParameter("@toDate", toDate);
        p_toDate.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter p_MOrgId = new SqlParameter("@m_org_id", GetUserContext().M_ORG_ID);
        p_MOrgId.SqlDbType = SqlDbType.Int;

        List<ReportItogRowViewModel> report = db.Database.SqlQuery<ReportItogRowViewModel>("EXEC [dbo].[GET_REPORT_ITOG] @fromDate = @fromDate, @toDate = @toDate, @m_org_id = @m_org_id", p_fromDate, p_toDate, p_MOrgId).ToList();

        return Content(JsonConvert.SerializeObject(report), "application/json");
      }
    }


    // сохранение режима Выписка, сохранение полей, кроме файлов
    [HttpPost]
    public ActionResult VipisSaveInfo(VipisViewModel vipis) {

      DateTimeToUniversalTime(vipis);
      DateTime now = CreateDate();
      UserContext uc = GetUserContext();

      using(ATLANTEntities db = new ATLANTEntities()) {

        O_VIPIS newVipis;

        if (vipis.O_VIPIS_ID != 0) {
          O_VIPIS vipisDb = db.O_VIPIS.AsNoTracking().Where(x => x.ID == vipis.O_VIPIS_ID).FirstOrDefault();
          if (vipisDb == null) {
            return HttpNotFound("Не удалось найти O_VIPIS с ID = " + vipis.O_VIPIS_ID);
          }
          db.O_VIPIS.Remove(db.O_VIPIS.Find(vipisDb.ID));
          newVipis = vipisDb;
        } else {
          newVipis = new O_VIPIS() {
            ID = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_VIPIS_ID as int)").First(),
            D_START = now,
            M_ORG_ID = uc.M_ORG_ID,
            USERID = uc.ID,
            O_ANK_ID = vipis.O_ANK_ID,
          };
        }

        newVipis.M_ZABOL_GROUP_ID = vipis.M_ZABOL_GROUP_ID;
        newVipis.ZABOL_TEXT = vipis.ZABOL_TEXT;
        newVipis.ULUCH_TEXT = vipis.ULUCH_TEXT;
        newVipis.D_ULUCH = vipis.D_ULUCH;
        newVipis.LINK = vipis.LINK;
        newVipis.LINK_POSLE = vipis.LINK_POSLE;

        db.O_VIPIS.Add(newVipis);
        db.SaveChanges();

        // сохранение улучшений по заболеваниям
        db.O_VIPIS_ULUCH.RemoveRange(
          db.O_VIPIS_ULUCH.Where(x => x.O_VIPIS_ID == newVipis.ID)
        );

        IEnumerable<O_VIPIS_ULUCH> uluch = 
          vipis.oVipisUluch.Select(x => 
            new O_VIPIS_ULUCH() {
              ID = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_VIPIS_ULUCH_ID as int) ID").First(),
              D_START = now,
              M_ORG_ID = uc.M_ORG_ID,
              USERID = uc.ID,
              O_VIPIS_ID = newVipis.ID,
              M_ZABOL_ID = x
          });

        db.O_VIPIS_ULUCH.AddRange(uluch);

        db.SaveChanges();

        return Content(JsonConvert.SerializeObject(new {success = true, O_VIPIS_ID = newVipis.ID}),
                       "application/json");

      }

    }

    // сохранение режима Выписка, сохранение файлов
    [HttpPost]
    //public ActionResult VipisSave(VipisViewModel vipis) {
    public ActionResult VipisSaveFiles(int O_VIPIS_ID, IList<HttpPostedFileBase> zabolFiles, IList<HttpPostedFileBase> uluchFiles) {

      UserContext uc = GetUserContext();
      DateTime now = CreateDate();

      using(ATLANTEntities db = new ATLANTEntities()) {

        Func<Stream, byte[]> toByteArray = new Func<Stream, byte[]>(x => {
          MemoryStream ms = new MemoryStream();
          x.CopyTo(ms);
          return ms.ToArray();
        });


        foreach(HttpPostedFileBase f in zabolFiles) {        
          
          O_VIPIS_FILE_ZABOL fZabol = new O_VIPIS_FILE_ZABOL() {
            ID = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_VIPIS_FILE_ZABOL_ID as int) ID").First(),
            D_START = now,
            O_VIPIS_ID = O_VIPIS_ID,
            M_ORG_ID = uc.M_ORG_ID,
            USERID = uc.ID,
            FNAME = f.FileName,
            F = toByteArray(f.InputStream)            
          };

          db.O_VIPIS_FILE_ZABOL.Add(fZabol);

        }  


        foreach(HttpPostedFileBase f in uluchFiles) {        
          
          O_VIPIS_FILE_ULUCH fUluch = new O_VIPIS_FILE_ULUCH() {
            ID = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_VIPIS_FILE_ULUCH_ID as int) ID").First(),
            D_START = now,
            O_VIPIS_ID = O_VIPIS_ID,
            M_ORG_ID = uc.M_ORG_ID,
            USERID = uc.ID,
            FNAME = f.FileName,
            F = toByteArray(f.InputStream)            
          };

          db.O_VIPIS_FILE_ULUCH.Add(fUluch);

        }

        db.SaveChanges();

      }

      return Content(JsonConvert.SerializeObject(new {success = true}), "application/json");

    }


    // получить Результаты по переданной анкете
    [HttpGet]
    public ActionResult GetVipiski(int O_ANK_ID) {

      
      using(ATLANTEntities db = new ATLANTEntities()) {

        O_VIPIS dbVipis = db.O_VIPIS.Where(x => x.O_ANK_ID == O_ANK_ID).FirstOrDefault();

        VipisViewModel vipisVM;

        // если Результаты ещё ни разу не создавали для этой анкеты
        if (dbVipis == null) {
          vipisVM = new VipisViewModel();
          return Content(JsonConvert.SerializeObject(vipisVM), "application/json");
        }


        vipisVM = new VipisViewModel() {
          O_VIPIS_ID = dbVipis.ID,
          D_ULUCH = dbVipis.D_ULUCH,
          M_ZABOL_GROUP_ID = dbVipis.M_ZABOL_GROUP_ID,
          O_ANK_ID = dbVipis.O_ANK_ID.Value,
          ZABOL_TEXT = dbVipis.ZABOL_TEXT,
          ULUCH_TEXT = dbVipis.ULUCH_TEXT,
          LINK = dbVipis.LINK,
          LINK_POSLE = dbVipis.LINK_POSLE,
          oVipisUluch = db.O_VIPIS_ULUCH.Where(x => x.O_VIPIS_ID == dbVipis.ID).Select(x => x.M_ZABOL_ID).ToList()
        };

        return Content(JsonConvert.SerializeObject(vipisVM), "application/json");

      }

    }


    // получить список названий файлов Заболеваний и путь к ним
    public ActionResult GetVipisZabolFiles(int O_VIPIS_ID) {

      using(ATLANTEntities db = new ATLANTEntities()) {

        var r = 
          db.O_VIPIS_FILE_ZABOL.Where(x => x.O_VIPIS_ID == O_VIPIS_ID)
            .Select(x => new {O_VIPIS_FILE_ZABOL_ID = x.ID, FNAME = x.FNAME});

        return Content(JsonConvert.SerializeObject(r), "application/json");

      }

    }


    // получить бинарный файл Заболеваний из Результаты
    public ActionResult GetVipisZabolFile(int O_VIPIS_FILE_ZABOL_ID) {

      using(ATLANTEntities db = new ATLANTEntities()) {

        O_VIPIS_FILE_ZABOL zabolFile = db.O_VIPIS_FILE_ZABOL.Find(O_VIPIS_FILE_ZABOL_ID);
        return File(zabolFile.F, "application/octet-stream", zabolFile.FNAME);

      }

    }


    // получить список названий файлов Улучшений и путь к ним
    public ActionResult GetVipisUluchFiles(int O_VIPIS_ID) {

      using(ATLANTEntities db = new ATLANTEntities()) {

        var r = 
          db.O_VIPIS_FILE_ULUCH.Where(x => x.O_VIPIS_ID == O_VIPIS_ID)
            .Select(x => new {O_VIPIS_FILE_ULUCH_ID = x.ID, FNAME = x.FNAME});

        return Content(JsonConvert.SerializeObject(r), "application/json");

      }

    }


    // получить бинарный файл Улучшений из Результаты
    public ActionResult GetVipisUluchFile(int O_VIPIS_FILE_ULUCH_ID) {

      using(ATLANTEntities db = new ATLANTEntities()) {

        O_VIPIS_FILE_ULUCH uluchFile = db.O_VIPIS_FILE_ULUCH.Find(O_VIPIS_FILE_ULUCH_ID);
        return File(uluchFile.F, "application/octet-stream", uluchFile.FNAME);

      }

    }


    // поиск человека среди рекомендованных по номеру телефона
    [HttpGet]
    public ActionResult GetRekAnkFio(string phone) {

      if(phone == null) {
        return Content(JsonConvert.SerializeObject(new {
          id = "", fio = ""
        }), "application/json");
      } else {

        UserContext uc = GetUserContext();

        using(ATLANTEntities db = new ATLANTEntities()) {

          // проверяю, есть ли человек с таким телефоном среди контактов
          var kont = db.O_KONT_ANK.Where(x => x.M_ORG_ID == uc.M_ORG_ID && x.PHONE == phone).FirstOrDefault();
          var a = db.O_REK_ANK.Where(x => x.PHONE == phone && x.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();
          var k = -1;
          
          if (kont != null) {
            k = (kont.USERID ?? -1);
          }

          if(a != null) {
            var b = db.O_ANK.Find(a.O_ANK_ID_REK);
            if (b != null) {
              return Content(JsonConvert.SerializeObject(new {
                              id = b.ID,
                              fio = (b.SURNAME ?? "") + " " + (b.NAME ?? "") + " " + (b.SECNAME ?? ""),
                              ist_inf_userid = k
                     }), "application/json");
            } else {
              return Content(JsonConvert.SerializeObject(new { id = "", fio = "", ist_inf_userid = k }), "application/json");
            }
          } else {
            return Content(JsonConvert.SerializeObject(new { id = "", fio = "", ist_inf_userid = k }), "application/json");
          }
        }
      }
    }

    // Получения данных для отображения календаря продаж
    [HttpPost]
    public ActionResult GetSalesCalendar(DateTime? fromDate, DateTime? toDate) {
      // избавляюсь от разницы +4 часа
      fromDate = DateTimeToUniversalTime(fromDate);
      toDate = DateTimeToUniversalTime(toDate);

      using (ATLANTEntities db = new ATLANTEntities()) {
        SqlParameter p_fromDate = new SqlParameter("@date0", fromDate);
        p_fromDate.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter p_toDate = new SqlParameter("@date1", toDate);
        p_toDate.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter p_MOrgId = new SqlParameter("@m_org_id", GetUserContext().M_ORG_ID);
        p_MOrgId.SqlDbType = SqlDbType.Int;

        List<CalendProdajData> report = db.Database.SqlQuery<CalendProdajData>(
          "EXEC [dbo].[GET_SALES_CALENDAR] @date0 = @date0, @date1 = @date1, @m_org_id = @m_org_id",
          p_fromDate, p_toDate, p_MOrgId
        ).ToList();

        return Content(JsonConvert.SerializeObject(report), "application/json");
      }
    }


    // Дилер A - Задачи - сохранение
    [HttpPost]
    public ActionResult O_ZADACHASave(O_ZADACHA zadacha) {

      // избавляюсь от разницы +4 часа
      DateTimeToUniversalTime(zadacha);

      DateTime now = CreateDate();
      UserContext uc = GetUserContext();

      using(ATLANTEntities db = new ATLANTEntities()) {

        zadacha.ID = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_ZADACHA_ID as int)").First();
        zadacha.D_START = now;
        zadacha.M_ORG_ID = uc.M_ORG_ID;
        zadacha.USERID = uc.ID;

        db.O_ZADACHA.Add(zadacha);
        db.SaveChanges();

        return Content(JsonConvert.SerializeObject(new {success = true}), "application/json");

      }
    }


    // Дилер - Задачи - список всех задач
    [HttpGet]
    public ActionResult GetZadachi() {

      UserContext uc = GetUserContext();
      DateTime now = CreateDate();

      using(ATLANTEntities db = new ATLANTEntities()) {

        // для дилера A возвращаю все задачи, которые есть для всех салонов
        // для остальных салонов возвращаю только задачи этого салона
        List<O_ZADACHA> zadachi = null;
        if (uc.M_ORG_TYPE_ID == M_ORG_TYPE_ID_DILER_A) {
           zadachi = db.O_ZADACHA.ToList();
        } else {
          zadachi = db.O_ZADACHA.Where(x => x.M_ORG_ID_ZADACHA == uc.M_ORG_ID).ToList();
        }

        // задачи в процессе
        var vPr = zadachi.Where(x => x.D_BEG <= now.Date && x.D_END >= now.Date && !x.D_VIP.HasValue);

        // задачи выполненные
        var vip = zadachi.Where(x => x.D_VIP.HasValue);

        // задачи не выполненные
        var neVip = zadachi.Where(x => !x.D_VIP.HasValue && x.D_END < now.Date);

        return Content(JsonConvert.SerializeObject(new { vPr = vPr, vip = vip, neVip = neVip}), "application/json");

      } 
    }


    // Дилер - Задачи - выполнить задачу
    [HttpPost]
    public ActionResult O_ZADACHAVip(O_ZADACHA zadacha) {

      UserContext uc = GetUserContext();
      DateTime now = CreateDate();

      using(ATLANTEntities db = new ATLANTEntities()) {

        var z = db.O_ZADACHA.Find(zadacha.ID);

        z.D_MODIF = now;
        z.D_VIP = now;
        z.USERID_VIP = uc.ID;

        db.SaveChanges();

        return Content(JsonConvert.SerializeObject(new {success = true}), "application/json");

      }
    }


    // получить список оповещений
    [HttpGet]
    public ActionResult GetOpovList() {
    
      using(ATLANTEntities db = new ATLANTEntities()) {

        // оповещения о том, что пришёл чужой клиент
        var res = db.Database.SqlQuery<GetOpovListViewModel>("exec dbo.GET_OPOV_LIST;").ToList();
        
        return Content(JsonConvert.SerializeObject(res), "application/json");
      }
    }

    // для автопоиска телефона по ФИО для уведомления
    [HttpGet]
    public string GetO_ANK_PHONE(String term) {

      if (String.IsNullOrEmpty(term)) {
        return "";
      }

      using (ATLANTEntities db = new ATLANTEntities()) {
        var ank = db.O_ANK.Where(n => ((n.SURNAME ?? "") + " " + (n.NAME ?? "") + " " + (n.SECNAME ?? "")).ToLower() == term.ToLower()).FirstOrDefault();
        if (ank == null) {
          return "";
        } else {
          return (ank.PHONE_MOBILE ?? ank.PHONE_HOME);
        }
      }

    }

    // получить данные для режима Отчеты - Уведомление
    [HttpGet]
    public ActionResult GetReportUvedoml(DateTime? date0, DateTime? date1) {

      if (!date0.HasValue || !date1.HasValue) {
        return Content(JsonConvert.SerializeObject(new { error = "Не заданы даты периода" }), "application/json");
      }

      UserContext uc = GetUserContext();

      // избавляюсь от разницы +4 часа
      date0 = DateTimeToUniversalTime(date0);
      date1 = DateTimeToUniversalTime(date1);

      DateTime d0 = new DateTime(date0.Value.Year, date0.Value.Month, date0.Value.Day, 0, 0, 0);
      DateTime d1 = new DateTime(date1.Value.Year, date1.Value.Month, date1.Value.Day, 0, 0, 0);

      using (ATLANTEntities db = new ATLANTEntities()) {
        SqlParameter pMOrgId = new SqlParameter("@m_org_id", uc.M_ORG_ID);
        pMOrgId.SqlDbType = SqlDbType.Int;

        SqlParameter pDate0 = new SqlParameter("@date0", d0);
        pDate0.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter pDate1 = new SqlParameter("@date1", d1);
        pDate1.SqlDbType = SqlDbType.SmallDateTime;

        var d = db.Database.SqlQuery<ReportUvedomlData>("EXEC [dbo].[GET_REPORT_UVEDOML] @date0 = @date0, @date1 = @date1, @m_org_id = @m_org_id",
                                                      pDate0, pDate1, pMOrgId);

        return Content(JsonConvert.SerializeObject(d), "application/json");
      }
    }

    [HttpPost]
    // создание уведомления по непришедшим из записи и контактам
    public ActionResult CreateUvedomlNepr() {
      UserContext uc = GetUserContext();
      DateTime now = CreateDate();

      using (ATLANTEntities db = new ATLANTEntities()) {
        List<M_SEANS_TIME> t = db.M_SEANS_TIME.Where(x => x.M_ORG_ID == uc.M_ORG_ID).ToList();
        List<O_SEANS> n = db.O_SEANS.Where(x => x.M_ORG_ID == uc.M_ORG_ID && DbFunctions.TruncateTime(x.SEANS_DATE) == now.Date &&
                                                x.SEANS_STATE == SEANS_STATE_ZAPISALSYA && x.D_REG == null).ToList();
        foreach (var s in n) {
          if (t != null) {
            var time = t.Find(x => x.ID == s.M_SEANS_TIME_ID);
            if (time != null) {

              int min = (now.Hour * 60) + now.Minute; // если не пришел спустя 40 минут
              if (time.MAX_TIME_MINUTES + 40 < min) {

                var e = db.O_UVEDOML.Where(x => x.O_SEANS_ID == s.ID).FirstOrDefault();
                if (e == null) {
                  O_UVEDOML u = new O_UVEDOML();
                  u.M_VID_SOB_ID = M_VID_SOB_NE_PRISHEDSHIE;
                  u.D_START = now;
                  u.D_SOB = s.SEANS_DATE;
                  u.O_ANK_ID = s.O_ANK_ID;
                  u.M_ORG_ID = s.M_ORG_ID;
                  u.USERID = (s.USERID ?? s.USERID_REG);
                  u.ISP = 0;
                  u.O_SEANS_ID = s.ID;

                  var ank = db.O_ANK.Find(s.O_ANK_ID);
                  if (ank != null) {
                    // #365 Не храним ФИО для анкет
                    //u.FIO = (ank.SURNAME ?? "") + " " + (ank.NAME ?? "") + " " + (ank.SECNAME ?? "");
                    u.PHONE = (ank.PHONE_MOBILE ?? ank.PHONE_HOME);
                  }

                  db.O_UVEDOML.Add(u);
                }
              }
            }
          }
        }

        db.SaveChanges();

        // создаем уведомление из контактов
        var kont = from k in db.O_KONT_ANK
                   from s in db.O_KONT_SEANS.Where(x => x.O_KONT_ANK_ID == k.ID).DefaultIfEmpty()
                   where (k.M_ORG_ID == uc.M_ORG_ID &&
                          DbFunctions.TruncateTime(s.SEANS_DATE) == now.Date &&
                          k.SKR == 0 &&
                          k.O_ANK_ID == null)
                   select new {
                     k.ID,
                     s.O_KONT_ANK_ID,
                     s.SEANS_DATE,
                     s.M_SEANS_TIME_ID,
                     k.M_ORG_ID,
                     s.USERID,
                     k.SURNAME,
                     k.NAME,
                     k.SECNAME,
                     k.PHONE
                   };

        foreach (var k in kont.ToList()) {
          if (t != null) {
            var time = t.Find(x => x.ID == k.M_SEANS_TIME_ID);
            if (time != null) {

              int min = (now.Hour * 60) + now.Minute; // если не пришел спустя 40 минут
              if (time.MAX_TIME_MINUTES + 40 < min) {
                var e = db.O_UVEDOML.Where(x => x.O_KONT_ANK_ID == k.ID).FirstOrDefault();
                if (e == null) {
                  O_UVEDOML u = new O_UVEDOML();
                  u.M_VID_SOB_ID = M_VID_SOB_NE_PRISHEDSHIE;
                  u.D_START = now;
                  u.D_SOB = k.SEANS_DATE;
                  u.M_ORG_ID = k.M_ORG_ID;
                  u.USERID = k.USERID;
                  u.ISP = 0;
                  u.O_KONT_ANK_ID = k.ID;
                  u.FIO = (k.SURNAME ?? "") + " " + (k.NAME ?? "") + " " + (k.SECNAME ?? "");
                  u.PHONE = k.PHONE;

                  db.O_UVEDOML.Add(u);
                }
              }
            }
          }
        }

        db.SaveChanges();

        // удаляем уведомление, если человек пришел
        List<O_UVEDOML> ul = db.O_UVEDOML.Where(x => x.M_ORG_ID == uc.M_ORG_ID &&
                                                DbFunctions.TruncateTime(x.D_SOB) == now.Date &&
                                                (x.O_SEANS_ID != null || x.O_KONT_ANK_ID != null) &&
                                                x.ISP == 0).ToList();
        foreach (var e in ul) {
          // сеансы, которые прошли регистрацию
          var s = db.O_SEANS.Where(x => x.ID == e.O_SEANS_ID && x.M_ORG_ID == uc.M_ORG_ID && x.D_REG != null && x.SEANS_STATE == SEANS_STATE_SOSTOYALSYA).FirstOrDefault();
          if (s != null) {
            db.O_UVEDOML.Remove(e);
          }
          // контакты, по которым создана акета
          var k = db.O_KONT_ANK.Where(x => x.ID == e.O_KONT_ANK_ID && x.M_ORG_ID == uc.M_ORG_ID && x.O_ANK_ID != null && x.SKR == 2).FirstOrDefault();
          if (k != null) {
            db.O_UVEDOML.Remove(e);
          }
        }

        db.SaveChanges();

      }

      return Content(JsonConvert.SerializeObject(new { success = true}), "application/json");
    }

    // #348
    // Наполняемость салона в указаннуй период в абсолютном значении
    public double dgGetNapolnPeriod (int m_org_id, DateTime fromDt, DateTime toDt) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        return db.O_SEANS.Where(y => y.M_ORG_ID == m_org_id &&
                                     DbFunctions.TruncateTime(y.D_REG) >= fromDt.Date &&
                                     DbFunctions.TruncateTime(y.D_REG) <= toDt.Date).Count();
      }
    }

    // #348
    // Количество новых посетителей в указанный период
    public double dgGetNovPosetCountPeriod (int m_org_id, DateTime fromDt, DateTime toDt) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        return db.O_ANK.Where(x => x.M_ORG_ID == m_org_id &&
                                   DbFunctions.TruncateTime(x.DATE_REG) >= fromDt.Date &&
                                   DbFunctions.TruncateTime(x.DATE_REG) <= toDt.Date).Count();
      }
    }

    // #348
    // Звонки салона в указанный период
    public double dgGetZvonkiCountPeriod(int m_org_id, DateTime fromDt, DateTime toDt) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        return db.O_ZVONOK.Where(x => x.M_ORG_ID == m_org_id &&
                                      DbFunctions.TruncateTime(x.D_START) >= fromDt.Date &&
                                      DbFunctions.TruncateTime(x.D_START) <= toDt.Date).Count();
      }
    }

    // #348
    // Количество сотрудников салона, выполнивших вход в систему в указанный период
    public double dgGetSotrudCountPeriod(int m_org_id, DateTime fromDt, DateTime toDt) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        return db.S_USER.Where(x => x.M_ORG_ID == m_org_id)
               .Join(db.S_USER_SIGN_LOG, u => u.ID, l => l.S_USER_ID, (u, l) => l)
               .Where(x => DbFunctions.TruncateTime(x.D_SIGN) >= fromDt.Date &&
                           DbFunctions.TruncateTime(x.D_SIGN) <= toDt.Date).Count();
      }
    }

    // #348
    // Количество собранных контактов в указанный период
    public double dgGetKontCountPeriod(int m_org_id, DateTime fromDt, DateTime toDt) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        return db.O_KONT_ANK.Where(x => x.M_ORG_ID == m_org_id &&
                                        DbFunctions.TruncateTime(x.D_START) >= fromDt.Date &&
                                        DbFunctions.TruncateTime(x.D_START) <= toDt.Date).Count();
      }
    }

    // #378
    // Дилер А - Маркетинговый календарь, получение доступных для выбора лет формирования отчета
    [HttpGet]
    public ActionResult GetDilerAMarketingKalendYears() {

      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {

        SqlParameter pM_org_id = new SqlParameter("@m_org_id", uc.M_ORG_ID);
        pM_org_id.SqlDbType = SqlDbType.Int;

        var d = db.Database.SqlQuery<int>("EXEC [dbo].[GET_DILER_A_MARKETING_KALEND_YEARS] @m_org_id = @m_org_id", pM_org_id);

        return Content(JsonConvert.SerializeObject(d), "application/json");

      }

    }

    public ActionResult PrintAbonement() {
      return View();
    }




    // для автопоиска по номеру телефона в режиме Контакты
    [HttpGet]
    public ActionResult GetKontSearchList(string term) {

      UserContext uc = GetUserContext();
      DateTime now = CreateDate();
      IEnumerable<GetKontSearchListViewModel> fio;
      term = term.Replace("+", "").Replace("-", "").Replace("(", "").Replace(")", "").Replace(" ", "");

      if (String.IsNullOrEmpty(term)) {
        return Json(new {empty = true}, JsonRequestBehavior.AllowGet);
      }

      using (ATLANTEntities db = new ATLANTEntities()) {

        
        fio =
          // поиск по Контактам, кроме Скрытых
          db.O_KONT_ANK.Where(n => n.M_ORG_ID == uc.M_ORG_ID &&
                                       n.SKR == O_KONT_ANK_SKR_NE_SKRITA &&
                                       n.PHONE.Replace("+", "").Replace("-", "").Replace("(", "").Replace(")", "").Replace(" ", "").Contains(term))
          .Select(n => new GetKontSearchListViewModel
            {
              value = (n.PHONE) + " " + (n.SURNAME ?? "") + " " + (n.NAME ?? "") + " " + (n.SECNAME ?? ""),
              id = n.ID,
              date = db.O_KONT_SEANS.FirstOrDefault(x => x.O_KONT_ANK_ID == n.ID).SEANS_DATE,
              KontOrRek = "KONT"
            }

          // поиск по Рекомендованым
          ).Union(
            db.O_REK_ANK.Where(n => n.M_ORG_ID == uc.M_ORG_ID &&
                                    n.SKR == O_REK_ANK_SKR_NE_SKRITA &&
                                    n.PHONE.Replace("+", "").Replace("-", "").Replace("(", "").Replace(")", "").Replace(" ", "").Contains(term))
            .Select(n => new GetKontSearchListViewModel
              {
                value = (n.PHONE) + " " + (n.SURNAME ?? "") + " " + (n.NAME ?? "") + " " + (n.SECNAME ?? ""),
                id = n.ID,
                date = db.O_KONT_SEANS.FirstOrDefault(x => x.O_KONT_ANK_ID == n.ID).SEANS_DATE,
                KontOrRek = "REK"
              }
            )
          )
          .ToList()
        ;


        // для Контактов проверяем, не является ли он Не пришедшим
        fio.ForEach(x => {
          x.NEPR = 0;
          if (x.KontOrRek == "KONT") {
            O_KONT_SEANS seans = db.O_KONT_SEANS.Where(s => s.O_KONT_ANK_ID == x.id).FirstOrDefault();
            if (seans == null) {
              throw new Exception("dbo.O_KONT_SEANS.O_KONT_ANK_ID == " + x.id + " was not found");
            }
            if (!seans.SEANS_DATE.HasValue || seans.SEANS_DATE < now.Date) {
              x.NEPR = 1;
            }
          }
        });

        

      }

      return Content(JsonConvert.SerializeObject(fio), "application/json");

    }

    // Возвращает список новых O_ANK.ID по заданному количеству
    [HttpGet]
    public ActionResult GetOAnkIds(int kolvo) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        SqlParameter pKolvo = new SqlParameter("@kolvo", kolvo);
        pKolvo.SqlDbType = SqlDbType.Int;

        var d = db.Database.SqlQuery<int>("EXEC [dbo].[GET_O_ANK_ID_LIST_REZERV] @kolvo = @kolvo", pKolvo);

        return Content(JsonConvert.SerializeObject(d), "application/json");
      }
    }

    [HttpPost]
    // выгрузка штрих-кодов в архив
    public ActionResult GetBarcodeFile (List<BarcodeData> d) {
      UserContext uc = GetUserContext();
      string directory = Server.MapPath("~/Content/" + Guid.NewGuid().ToString()),
             image = directory + "/barcode_",
             archive = Server.MapPath("~/Content/Штрих-коды_" + uc.M_ORG_ID.ToString() + ".zip"),
             filename = "/Content/Штрих-коды_" + uc.M_ORG_ID.ToString() + ".zip";

      int i = 1;

      if (!System.IO.Directory.Exists(directory)) {
        System.IO.Directory.CreateDirectory(directory);
      }

      if (System.IO.File.Exists(archive)) {
        System.IO.File.Delete(archive);
      }

      try {
        foreach (var a in d) {

          byte[] imageBytes = Convert.FromBase64String(a.img);
          string filePath = image + i.ToString() + ".jpg";

          System.IO.File.WriteAllBytes(filePath, imageBytes);

          i++;
        }

        ZipFile zf = new ZipFile(archive);
        zf.AddDirectory(directory);
        zf.Save();

        if (System.IO.Directory.Exists(directory)) {
          System.IO.Directory.Delete(directory, true);
        }

      } catch (Exception e) {
        if (System.IO.Directory.Exists(directory)) {
          System.IO.Directory.Delete(directory, true);
        }

        if (System.IO.File.Exists(archive)) {
          System.IO.File.Delete(archive);
        }

        throw new Exception(e.Message);
      }

      return Json(new { file = filename });
    }



    // удобный метод для применения значения SQL параметра, если значения
    // нет, то возвратиться DBNull.Value, в противном случае возвратится значение
    private object DBNullOrValue<T>(Nullable<T> param) where T: struct {

      if (param.HasValue) {
        return param;
      } else {
        return DBNull.Value;
      }

    }

    // получить справочник пользователей S_USER, приведенный к виду ID, NAME
    [HttpGet]
    public ContentResult GetS_USER_FIO() {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        var sUserFio = from u in db.S_USER
                       from a in db.AspNetUsers.Where(x => x.Id == u.AspNetUsersId).DefaultIfEmpty()
                       where u.M_ORG_ID == uc.M_ORG_ID
                       select new {
                         ID = u.ID,
                         NAME = (u.SURNAME ?? "") + " " + (u.NAME ?? "") + " " + (u.SECNAME ?? "")
                       };
        return Content(JsonConvert.SerializeObject(sUserFio), "application/json");
      }
    }



    // добавить запись в таблицу O_KONT_STAT
    private void O_KONT_STATAdd(O_KONT_STAT_TIP_IZM TIP_IZM, int? M_KONT_STATUS_ID = null, int? M_KONT_IST_ID = null) {

      DateTime now = CreateDate();
      UserContext uc = GetUserContext();
      using(ATLANTEntities db = new ATLANTEntities()) {
        O_KONT_STAT stat = new O_KONT_STAT() {
          ID = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_KONT_STAT_ID as int) id").First(),
          D_START = now,
          D_MODIF = null,
          M_ORG_ID = uc.M_ORG_ID,
          USERID = uc.ID,
          TIP_IZM = (int)TIP_IZM,
          M_KONT_STATUS_ID = M_KONT_STATUS_ID,
          M_KONT_IST_ID = M_KONT_IST_ID
        };
        db.O_KONT_STAT.Add(stat);
        db.SaveChanges();
      }

    }


    // сформировать отчёт Контакты - Статистика
    public ActionResult GetKontStatReport(int S_USER_ID, DateTime? periodS, DateTime? periodPo) {

      if (periodS == null) {
        periodS = new DateTime(2000, 1, 1);
      } else {
        // избавляюсь от разницы +4 часа
        periodS = DateTimeToUniversalTime(periodS);
      }

      if (periodPo == null) {
        periodPo = new DateTime(2079, 1, 1);
      } else {
        // избавляюсь от разницы +4 часа
        periodPo = DateTimeToUniversalTime(periodPo);
      }

      using(ATLANTEntities db = new ATLANTEntities()) {

        var zaPeriodByUserId = db.O_KONT_STAT.Where(
            x => x.USERID == S_USER_ID && 
                 DbFunctions.TruncateTime(x.D_START) >= periodS &&
                 DbFunctions.TruncateTime(x.D_START) <= periodPo
        );

        var rslt = new {
          UserName = db.AspNetUsers.Where(y => y.Id == db.S_USER.Where(x => x.ID == S_USER_ID).FirstOrDefault().AspNetUsersId).First().UserName,
          zvonok = zaPeriodByUserId.Where(x => x.TIP_IZM == (int)O_KONT_STAT_TIP_IZM.ZVONOK).Count(),
          kontakt = zaPeriodByUserId.Where(x => x.TIP_IZM == (int)O_KONT_STAT_TIP_IZM.SOZDAN_KONT).Count(),
          comment = zaPeriodByUserId.Where(x => x.TIP_IZM == (int)O_KONT_STAT_TIP_IZM.DOBAV_COMMENT).Count(),
          status = 
            zaPeriodByUserId.Where(x => x.TIP_IZM == (int)O_KONT_STAT_TIP_IZM.IZM_STATUS)
              .GroupBy(x => new {x.M_KONT_STATUS_ID})
              .Select(x => new {name = db.M_KONT_STATUS.FirstOrDefault(o => o.ID == x.Key.M_KONT_STATUS_ID).NAME, kolvo = x.Count()}),
          istochnik = 
            zaPeriodByUserId.Where(x => x.TIP_IZM == (int)O_KONT_STAT_TIP_IZM.IZM_ISTOCH)
              .GroupBy(x => new {x.M_KONT_IST_ID})
              .Select(x => new {name = db.M_KONT_IST.FirstOrDefault(o => o.ID == x.Key.M_KONT_IST_ID).NAME, kolvo = x.Count()})

        };

        return Content(JsonConvert.SerializeObject(rslt), "application/json");

      }

    }

    // получить справочник Сопровождение - доп. услуги
    [HttpGet]
    public ContentResult GetM_SOPR_DOP() {
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from item in db.M_SOPR_DOP select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    // получить данные режима Сопровождение
    [HttpGet]
    public ContentResult GetSopr(int? page, int? rows_per_page, int? stat, string text, DateTime? dtfrom, DateTime? dtto, int? user) {
      UserContext uc = GetUserContext();
      DateTime now = new DateTime(1950, 1, 1);
      using (ATLANTEntities db = new ATLANTEntities()) {

        SqlParameter pPage = new SqlParameter("@page", page);
        pPage.SqlDbType = SqlDbType.Int;

        SqlParameter pRows_per_page = new SqlParameter("@rows_per_page", rows_per_page);
        pRows_per_page.SqlDbType = SqlDbType.Int;

        SqlParameter pStat = new SqlParameter("@stat", stat);
        pStat.SqlDbType = SqlDbType.Int;

        SqlParameter pM_org_id = new SqlParameter("@m_org_id", uc.M_ORG_ID);
        pM_org_id.SqlDbType = SqlDbType.Int;

        if (String.IsNullOrEmpty(text)) {
          text = "";
        }

        SqlParameter pText = new SqlParameter("@text", text);
        pText.SqlDbType = SqlDbType.VarChar;

        if (dtfrom.HasValue) {
          dtfrom = DateTimeToUniversalTime(dtfrom);
        } else {
          dtfrom = now;
        }

        if (dtto.HasValue) {
          dtto = DateTimeToUniversalTime(dtto);
        } else {
          dtto = now;
        }

        SqlParameter pDtForm = new SqlParameter("@dtfrom", dtfrom);
        pDtForm.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter pDtTo = new SqlParameter("@dtto", dtto);
        pDtTo.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter pUser = new SqlParameter("@user", user);
        pUser.SqlDbType = SqlDbType.Int;

        if (!user.HasValue) {
          pUser.SqlValue = 0;
        }

        var d = db.Database.SqlQuery<SoprData>(
          @"exec dbo.GET_SOPR_LIST @page = @page, @rows_per_page = @rows_per_page, @m_org_id = @m_org_id, @stat = @stat, 
                                   @text = @text, @dtfrom = @dtfrom, @dtto = @dtto, @user = @user",
          pPage, pRows_per_page, pM_org_id, pStat, pText, pDtForm, pDtTo, pUser).ToList();

        return Content(JsonConvert.SerializeObject(d), "application/json");

      }
    }

    [HttpPost]
    // сохранить данные режима Сопровождение
    public JsonResult SaveSopr(O_SOPR sopr) {
      UserContext uc = GetUserContext();
      DateTime now = CreateDate();

      using (ATLANTEntities db = new ATLANTEntities()) {
        var s = db.O_SOPR.Where(x => x.O_ANK_ID == sopr.O_ANK_ID && x.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();

        if (s != null) {
          if (sopr.D_START == null) {
            sopr.D_START = now;
            sopr.M_ORG_ID = uc.M_ORG_ID;
            sopr.USERID = uc.ID;
          }
          db.Entry(s).CurrentValues.SetValues(sopr);
        } else {
          sopr.D_START = now;
          sopr.M_ORG_ID = uc.M_ORG_ID;
          sopr.USERID = uc.ID;

          db.O_SOPR.Add(sopr);
        }
        db.SaveChanges();
      }
      return Json(new { success = true });
    }

    [HttpPost]
    // получить комментарии в сопровождении по выбранной строке
    public ContentResult GetSoprComment(O_SOPR sopr) {
      UserContext uc = GetUserContext();
      List<SoprCommentData> cd = new List<SoprCommentData>();
      using (ATLANTEntities db = new ATLANTEntities()) {
        // чтоб не падало с ошибкой
        if (sopr == null) {
          sopr = new O_SOPR();
        }

        if (sopr.ID == 0) {
          return Content(JsonConvert.SerializeObject(cd), "application/json");
        } else {

          var d = db.O_SOPR_COMMENT.Where(x => x.O_SOPR_ID == sopr.ID && x.M_ORG_ID == uc.M_ORG_ID).ToList();
          if (d.Count == 0) {
            return Content(JsonConvert.SerializeObject(cd), "application/json");
          } else {
            var list = d.OrderByDescending(x => x.ID).ToList();
            var i = d.Count;

            foreach(var l in list) {
              var user = "";
              var p = db.S_USER.Where(a => a.ID == l.USERID).FirstOrDefault();
              if (p != null) {
                user = (p.SURNAME ?? "");

                try {
                  user += " " + (p.NAME ?? "").Substring(1, 1).ToUpper() + ".";
                  user += " " + (p.SECNAME ?? "").Substring(1, 1).ToUpper() + ".";
                } catch (Exception e) {
                  var err = e.Message;
                }
              }

              SoprCommentData s = new SoprCommentData() {
                RN = i,
                D_START = l.D_START,
                COMMENT = l.COMMENT,
                ZADACHA = l.ZADACHA,
                O_ANK_ID = sopr.O_ANK_ID,
                O_SOPR_ID = sopr.ID,
                ID = l.ID,
                USERNAME = user
              };
              cd.Add(s);
              i--;
            }

            return Content(JsonConvert.SerializeObject(cd), "application/json");
          }

        }

      }
    }

    [HttpPost]
    // сохранить комментарии сопровождения
    public JsonResult SaveSoprComment(List<SoprCommentData> s) {
      UserContext uc = GetUserContext();
      DateTime now = CreateDate();
      O_SOPR sopr = new O_SOPR();
      SoprCommentData last = s.Last();

      using (ATLANTEntities db = new ATLANTEntities()) {

        var p = db.O_SOPR.Where(x => x.O_ANK_ID == last.O_ANK_ID && x.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();

        if (p != null) {
          sopr.ID = p.ID;
        } else {
          sopr.D_START = now;
          sopr.M_ORG_ID = uc.M_ORG_ID;
          sopr.USERID = uc.ID;
          sopr.O_ANK_ID = last.O_ANK_ID;
          db.O_SOPR.Add(sopr);
          db.SaveChanges();
        }

        var list = s.OrderByDescending(x => -x.RN);

        foreach (var item in list) {
          if (item.ID == 0) {
            O_SOPR_COMMENT c = new O_SOPR_COMMENT() {
              ID = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_SOPR_COMMENT_ID as int) id").First(),
              D_START = DateTimeToUniversalTime(item.D_START),
              M_ORG_ID = uc.M_ORG_ID,
              USERID = uc.ID,
              O_SOPR_ID = sopr.ID,
              COMMENT = item.COMMENT,
              ZADACHA = item.ZADACHA
            };

            db.O_SOPR_COMMENT.Add(c);
          }
        }

        db.SaveChanges();

      }
      return Json(new { success = true });
    }

    [HttpGet]
    public ActionResult PrintNeProdlil() {
      return View();
    }

    // получаем данные отчета "Не продлил"
    public ContentResult UchetReportsNeProdlilData(DateTime? date0, DateTime? date1) {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {

        SqlParameter pMOrgId = new SqlParameter("@m_org_id", uc.M_ORG_ID);
        pMOrgId.SqlDbType = SqlDbType.Int;

        var d = db.Database.SqlQuery<UchetNeProdlilData>("EXEC [dbo].[GET_UCHET_REPORT_NE_PRODLIL] @m_org_id = @m_org_id", pMOrgId);

        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }


    // получить данные режима Продление
    [HttpGet]
    public ContentResult GetProdl(int page, int rows_per_page, int stat, string text, DateTime? dtfrom, DateTime? dtto, int? user) {
      UserContext uc = GetUserContext();
      DateTime now = new DateTime(1950, 1, 1);
      using (ATLANTEntities db = new ATLANTEntities()) {

        SqlParameter pPage = new SqlParameter("@page", page);
        pPage.SqlDbType = SqlDbType.Int;

        SqlParameter pRows_per_page = new SqlParameter("@rows_per_page", rows_per_page);
        pRows_per_page.SqlDbType = SqlDbType.Int;

        SqlParameter pStat = new SqlParameter("@stat", stat);
        pStat.SqlDbType = SqlDbType.Int;

        SqlParameter pM_org_id = new SqlParameter("@m_org_id", uc.M_ORG_ID);
        pM_org_id.SqlDbType = SqlDbType.Int;

        if (String.IsNullOrEmpty(text)) {
          text = "";
        }

        SqlParameter pText = new SqlParameter("@text", text);
        pText.SqlDbType = SqlDbType.VarChar;

        if (dtfrom.HasValue) {
          dtfrom = DateTimeToUniversalTime(dtfrom);
        } else {
          dtfrom = now;
        }

        if (dtto.HasValue) {
          dtto = DateTimeToUniversalTime(dtto);
        } else {
          dtto = now;
        }

        SqlParameter pDtForm = new SqlParameter("@dtfrom", dtfrom);
        pDtForm.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter pDtTo = new SqlParameter("@dtto", dtto);
        pDtTo.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter pUser = new SqlParameter("@user", user);
        pUser.SqlDbType = SqlDbType.Int;
        
        if (!user.HasValue) {
          pUser.SqlValue = 0;
        }

        var d = db.Database.SqlQuery<ProdlData>(
          @"exec dbo.GET_PRODL_LIST @page = @page, @rows_per_page = @rows_per_page, @m_org_id = @m_org_id, @stat = @stat, 
                                   @text = @text, @dtfrom = @dtfrom, @dtto = @dtto, @user = @user",
          pPage, pRows_per_page, pM_org_id, pStat, pText, pDtForm, pDtTo, pUser).ToList();

        return Content(JsonConvert.SerializeObject(d), "application/json");

      }
    }

    [HttpPost]
    // сохранить данные режима Продление
    public JsonResult SaveProdl(O_PRODL prodl) {
      UserContext uc = GetUserContext();
      DateTime now = CreateDate();

      using (ATLANTEntities db = new ATLANTEntities()) {
        var p = db.O_PRODL.Where(x => x.O_ANK_ID == prodl.O_ANK_ID && x.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();

        if (p != null) {
          if (prodl.D_START == null) {
            prodl.D_START = now;
            prodl.M_ORG_ID = uc.M_ORG_ID;
            prodl.USERID = uc.ID;
          }

          if (prodl.ID == 0) {
            prodl.ID = p.ID;
          }

          db.Entry(p).CurrentValues.SetValues(prodl);
        } else {
          prodl.D_START = now;
          prodl.M_ORG_ID = uc.M_ORG_ID;
          prodl.USERID = uc.ID;

          db.O_PRODL.Add(prodl);
        }
        db.SaveChanges();
      }
      return Json(new { success = true });
    }

    [HttpPost]
    // получить комментарии в продлении по выбранной строке
    public ContentResult GetProdlComment(O_PRODL prodl) {
      UserContext uc = GetUserContext();
      List<ProdlCommentData> cd = new List<ProdlCommentData>();
      using (ATLANTEntities db = new ATLANTEntities()) {
        // чтоб не падало с ошибкой
        if (prodl == null) {
          prodl = new O_PRODL();
        }

        if (prodl.ID == 0) {
          return Content(JsonConvert.SerializeObject(cd), "application/json");
        } else {

          var d = db.O_PRODL_COMMENT.Where(x => x.O_PRODL_ID == prodl.ID && x.M_ORG_ID == uc.M_ORG_ID).ToList();
          if (d.Count == 0) {
            return Content(JsonConvert.SerializeObject(cd), "application/json");
          } else {
            var list = d.OrderByDescending(x => x.ID).ToList();
            var i = d.Count;

            foreach (var l in list) {
              var user = "";
              var p = db.S_USER.Where(a => a.ID == l.USERID).FirstOrDefault();
              if (p != null) {
                user = (p.SURNAME ?? "");

                try {
                  user += " " + (p.NAME ?? "").Substring(1, 1).ToUpper() + ".";
                  user += " " + (p.SECNAME ?? "").Substring(1, 1).ToUpper() + ".";
                } catch (Exception e) {
                  var err = e.Message;
                }
              }

              ProdlCommentData s = new ProdlCommentData() {
                RN = i,
                D_START = l.D_START,
                COMMENT = l.COMMENT,
                ZADACHA = l.ZADACHA,
                O_ANK_ID = prodl.O_ANK_ID,
                O_PRODL_ID = prodl.ID,
                ID = l.ID,
                USERNAME = user
              };
              cd.Add(s);
              i--;
            }

            return Content(JsonConvert.SerializeObject(cd), "application/json");
          }

        }

      }
    }

    [HttpPost]
    // сохранить комментарии продления
    public JsonResult SaveProdlComment(List<ProdlCommentData> s) {
      UserContext uc = GetUserContext();
      DateTime now = CreateDate();
      O_PRODL prodl = new O_PRODL();
      ProdlCommentData last = s.Last();

      using (ATLANTEntities db = new ATLANTEntities()) {

        var p = db.O_PRODL.Where(x => x.O_ANK_ID == last.O_ANK_ID && x.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();

        if (p != null) {
          prodl.ID = p.ID;
        } else {
          prodl.D_START = now;
          prodl.M_ORG_ID = uc.M_ORG_ID;
          prodl.USERID = uc.ID;
          prodl.O_ANK_ID = last.O_ANK_ID;
          db.O_PRODL.Add(prodl);
          db.SaveChanges();
        }

        var list = s.OrderByDescending(x => -x.RN);

        foreach (var item in list) {
          if (item.ID == 0) {
            O_PRODL_COMMENT c = new O_PRODL_COMMENT() {
              ID = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_PRODL_COMMENT_ID as int) id").First(),
              D_START = DateTimeToUniversalTime(item.D_START),
              M_ORG_ID = uc.M_ORG_ID,
              USERID = uc.ID,
              O_PRODL_ID = prodl.ID,
              COMMENT = item.COMMENT,
              ZADACHA = item.ZADACHA
            };

            db.O_PRODL_COMMENT.Add(c);
          }
        }

        db.SaveChanges();

      }
      return Json(new { success = true });
    }

    [HttpGet]
    public ActionResult UchetReportsGost() {
      return View();
    }

    // получаем данные посетителей из других салонов
    public ContentResult UchetReportsGostData(DateTime? date0, DateTime? date1) {
      UserContext uc = GetUserContext();

      // избавляюсь от разницы +4 часа
      date0 = DateTimeToUniversalTime(date0);
      date1 = DateTimeToUniversalTime(date1);

      using (ATLANTEntities db = new ATLANTEntities()) {
        SqlParameter pMOrgId = new SqlParameter("@m_org_id", uc.M_ORG_ID);
        pMOrgId.SqlDbType = SqlDbType.Int;

        SqlParameter pDate0 = new SqlParameter("@date0", date0);
        pDate0.SqlDbType = SqlDbType.SmallDateTime;

        SqlParameter pDate1 = new SqlParameter("@date1", date1);
        pDate1.SqlDbType = SqlDbType.SmallDateTime;

        var d = db.Database.SqlQuery<UchetGostData>(
          "EXEC [dbo].[GET_SKLAD_GOST_DATA] @m_org_id = @m_org_id, @date0 = @date0, @date1 = @date1", pMOrgId, pDate0, pDate1);

        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    [HttpGet]
    public ActionResult PrintGost() {
      return View();
    }
    
    
    // получить свободное место для регистрации (или наименее занятное, если свободных нет)
    [HttpGet]
    public ActionResult GetRegFreePlace(int M_SEANS_TIME_ID, int M_ORG_ID) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        SqlParameter pM_SEANS_TIME_ID = new SqlParameter("@m_seans_time_id", M_SEANS_TIME_ID);
        pM_SEANS_TIME_ID.SqlDbType = SqlDbType.Int;

        SqlParameter pM_ORG_ID = new SqlParameter("@m_org_id", M_ORG_ID);
        pM_ORG_ID.SqlDbType = SqlDbType.Int;

        var d = db.Database.SqlQuery<GetRegFreePlaceViewModel>("EXEC [dbo].[GET_REG_FREE_PLACE] @m_seans_time_id = @m_seans_time_id, @m_org_id = @m_org_id", pM_SEANS_TIME_ID, pM_ORG_ID).First();

        return Content(JsonConvert.SerializeObject(d), "application/json");
      }
    }



    // получить список людей, зарегистрированных на сегодня для режима Регистрация
    [HttpGet]
    public ActionResult GetRegList(int M_SEANS_TIME_ID, int M_ORG_ID) {

      using(ATLANTEntities db = new ATLANTEntities()) {

        SqlParameter pM_SEANS_TIME_ID = new SqlParameter("@m_seans_time_id", SqlDbType.Int);
        pM_SEANS_TIME_ID.Value = M_SEANS_TIME_ID;

        SqlParameter pM_ORG_ID = new SqlParameter("@m_org_id", SqlDbType.Int);
        pM_ORG_ID.Value = M_ORG_ID;

        List<GetRegListViewModel> regList = db.Database.SqlQuery<GetRegListViewModel>("exec dbo.GET_REG_LIST @m_seans_time_id = @m_seans_time_id, @m_org_id = @m_org_id ", pM_SEANS_TIME_ID, pM_ORG_ID).ToList();

        // теперь список абонементов с доп услугами для каждого посетителя
        regList.ForEach(x => {

          List<GetRegListDopUslViewModel> dopUslList = GetRegListDopUsl(db, x.o_ank_id, M_ORG_ID);
          x.dopUslList = dopUslList;

        });


        return Content(JsonConvert.SerializeObject(regList), "application/json");

      }

    }



    // получить список абонементов дополнительных услуг по анкете
    private List<GetRegListDopUslViewModel> GetRegListDopUsl(ATLANTEntities db, int o_ank_id, int M_ORG_ID) {

      SqlParameter pO_ANK_ID = new SqlParameter("@o_ank_id", SqlDbType.Int);
      pO_ANK_ID.Value = o_ank_id;

      SqlParameter pM_ORG_ID = new SqlParameter("@m_org_id", SqlDbType.Int);
      pM_ORG_ID.Value = M_ORG_ID;

      return db.Database.SqlQuery<GetRegListDopUslViewModel>("exec dbo.GET_REG_LIST_DOP_USL @o_ank_id = @o_ank_id, @m_org_id = @m_org_id", pO_ANK_ID, pM_ORG_ID).ToList();   
    }



    // получить план салона
    [HttpGet]
    public ActionResult GetMotiv() {
      using (ATLANTEntities db = new ATLANTEntities()) {
        UserContext uc = GetUserContext();
        var d = db.O_MOTIV.Where(u => u.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();
        return Content(JsonConvert.SerializeObject(d), "application/json");
      }
    }

    [HttpPost]
    // сохранить данные режима Сопровождение
    public JsonResult SaveMotiv(O_MOTIV m) {
      UserContext uc = GetUserContext();
      DateTime now = CreateDate();
      m.D_BEG = DateTimeToUniversalTime(m.D_BEG);
      m.D_END = DateTimeToUniversalTime(m.D_END);

      if (m.SUMMA == null) {
        throw new Exception("Сумма плана не задана");
      }

      if (m.D_BEG == null) {
        throw new Exception("Дата начала действия плана не задана");
      }

      if (m.D_END == null) {
        throw new Exception("Дата окончания действия плана не задана");
      }

      using (ATLANTEntities db = new ATLANTEntities()) {
        if (m.ID != 0) {
          var a = db.O_MOTIV.Find(m.ID);

          if (a != null) {
            db.Entry(a).CurrentValues.SetValues(m);
          }
        } else {
          m.M_ORG_ID = uc.M_ORG_ID;
          m.USERID = uc.ID;

          db.O_MOTIV.Add(m);
        }
        db.SaveChanges();
      }
      return Json(new { success = true });
    }

    // получить план салона
    [HttpGet]
    public ActionResult GetPlan() {
      using (ATLANTEntities db = new ATLANTEntities()) {
        UserContext uc = GetUserContext();
        int plan = 0, over = -1;
        double real = 0;
        string name = "/Content/img/";

        var d = db.O_MOTIV.Where(u => u.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();
        if (d != null) {
          var opl = db.O_SKLAD_RAS_PRODUCT_OPL.Where(o => o.M_ORG_ID == uc.M_ORG_ID &&
                                                          DbFunctions.TruncateTime(o.D_OPL) >= DbFunctions.TruncateTime(d.D_BEG) &&
                                                          DbFunctions.TruncateTime(o.D_OPL) <= DbFunctions.TruncateTime(d.D_END)).ToList();
          decimal sum = 0;
          foreach(var e in opl) {
            if (e.OPL != null) {
              sum += e.OPL.Value;
            }
          }

          try {
            if (sum < d.SUMMA.Value) {
              // округляем до ближайщего значения, кратного 5-ти - 20,25,30,35....
              real = Convert.ToDouble((sum / d.SUMMA.Value) * 100);
              plan = Convert.ToInt16(real);
              if (plan % 5 != 0) {
                plan = (plan / 5) * 5 + 5;
              }
            } else {
              if (d.SUMMA.Value == 0) {
                plan = -1;
              } else {
                plan = 100;
                if (d.PROCENT != null) {
                  over = (int)((sum - d.SUMMA.Value) * (d.PROCENT.Value / 100));
                }
              }
            }
          } catch(Exception e) {
            var mess = e.Message;
            plan = -1;
            over = -1;
          }
        } else {
          plan = -1;
          over = -1;
        }

        if (plan > 0) {
          name = name + plan.ToString() + ".png";
        } else {
          name = name + "0.png";
        }
        return Content(JsonConvert.SerializeObject(new { success = true, plan = plan, plan_photo = name, over = over }), "application/json");
      }
    }

    public static void Job1() {
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = db.Database.SqlQuery<AutoSmsSendData>("EXEC [dbo].[GET_SMS_AUTO_SEND_LIST]").ToList();

        if (d.Count > 0) {

          DbRawSqlQuery<int> newIdList = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_SMS_SEND_NUM as int);");
          int newId = newIdList.First();

          foreach (var e in d) {
            O_SMS_SEND s = new O_SMS_SEND();

            s.D_START = e.D_START;
            s.M_ORG_ID = e.M_ORG_ID;
            s.O_ANK_ID = e.O_ANK_ID;
            s.SEND_DATE = DateTime.Now;
            s.SEND_LOGIN = "Admin";
            s.SEND_NUM = newId;
            s.M_SMS_TEMPLATE_ID = e.M_SMS_TEMPLATE_TYPE_ID;
            s.SOOB = e.SOOB;
            s.USERID = 3; // Ид админа

            // отправляем смс
            var a = db.O_NASTR.Where(x => x.M_ORG_ID == e.M_ORG_ID).FirstOrDefault();
            string sender = "", login = "", password = "";
            if (a != null) {
              sender = (a.SMS_SENDER ?? "");
              login = (a.SMS_LOGIN ?? "");
              password = (a.SMS_PASSWORD ?? "");
            }

            HomeController c = new HomeController();
            string res = "",
                   url = "https://smsc.ru/sys/send.php",
                   data = "login=" + HttpUtility.UrlEncode(login) + "&psw=" + HttpUtility.UrlEncode(password) +
                   "&charset=utf-8&fmt=0&phones=" + e.PHONE + "&mes=" + e.SOOB;

            res = c.SendWebRequest(url, data);
            var i = 0;
            
            // проверяем на ошибку
            if (c.IsSendRequestError(res)) {
              i = c.GetWebRequestErrorCode(res) * -1;
            }

            // 0 - успешная отправка, число < 0 - код ошибки
            s.SEND_STATE = (i * -1);
            db.O_SMS_SEND.Add(s);
          }

          db.SaveChanges();
        }
      }
    }

    // скрываем запись на N дней в Учет - Отчеты - Не ходят
    public ContentResult HideAnk(int? ID, int? DAYS) {
      UserContext uc = GetUserContext();
      DateTime now = CreateDate();
      using (ATLANTEntities db = new ATLANTEntities()) {
        if (ID.HasValue) {
          var s = db.O_ANK.Where(x => x.ID == ID.Value).FirstOrDefault();

          if (s != null) {
            s.D_SKRYT_PO = now.AddDays(DAYS.Value).Date;
            db.SaveChanges();
          }
        }
        return Content(JsonConvert.SerializeObject(new { success = true }), "application/json");
      }
    }

    // получить справочник Настроек салона
    [HttpGet]
    public ContentResult GetO_NASTR() {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from item in db.O_NASTR where item.M_ORG_ID == uc.M_ORG_ID select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    [HttpGet]
    // Учет - Отчеты - Не ходят
    public ActionResult PrintNeHodyat() {
      return View();
    }

    // получаем данные списка покупателей
    [HttpGet]
    public ContentResult UchetReportsNeHodyatData(int? page, int? rows_per_page) {
      UserContext uc = GetUserContext();
        using (ATLANTEntities db = new ATLANTEntities()) {

          SqlParameter pPage = new SqlParameter("@page", page);
          pPage.SqlDbType = SqlDbType.Int;

          SqlParameter pRows_per_page = new SqlParameter("@rows_per_page", rows_per_page);
          pRows_per_page.SqlDbType = SqlDbType.Int;

          SqlParameter pM_org_id = new SqlParameter("@m_org_id", uc.M_ORG_ID);
          pM_org_id.SqlDbType = SqlDbType.Int;

          var d = db.Database.SqlQuery<UchetNeHodyatData>(
            @"exec dbo.GET_UCHET_REPORT_NE_HODYAT @page = @page, @rows_per_page = @rows_per_page, @m_org_id = @m_org_id",
            pPage, pRows_per_page, pM_org_id).ToList();

          int pageCnt = 0;
          if (d.ToList().Count > 0) {
            pageCnt = d.ToList().First().CNT_PAGE.Value;
          }

          List<int> pageNums = new List<int>();
          for (int i = 1; i <= pageCnt; i += 1) {
            pageNums.Add(i);
          }

          return Content(JsonConvert.SerializeObject(new { spisok = d.ToList(), pageNums = pageNums }), "application/json"
          );
      }
    }

    // Запись, Товар
    [HttpGet]
    public ActionResult GetRecordProductList(int O_ANK_ID) {

      // последний купленный товар, если он есть
      using (ATLANTEntities db = new ATLANTEntities()) {

        SqlParameter pO_ank_id = new SqlParameter("@o_ank_id", O_ANK_ID);
        pO_ank_id.SqlDbType = SqlDbType.Int;

        var d = db.Database.SqlQuery<RecordAnkProductData>("EXEC [dbo].[GET_RECORD_PRODUCT_LIST] @o_ank_id = @o_ank_id", pO_ank_id);

        return Content(JsonConvert.SerializeObject(d), "application/json");
      }
    }

    // Выгрузить сопровождение
    [HttpPost]
    public ActionResult ExportSoprToExcel(int? status) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        string statName = "статусу 'Любой'",
               prodName = "",
               dopName = "",
               formOplName = "";

        List<M_SOPR_STATUS> ss = db.M_SOPR_STATUS.ToList();
        List<M_SOPR_PRODUCT> sp = db.M_SOPR_PRODUCT.ToList();
        List<M_SOPR_DOP> sdp = db.M_SOPR_DOP.ToList();
        List<M_SOPR_FORM_OPL> sf = db.M_SOPR_FORM_OPL.ToList();

        var s = new M_SOPR_STATUS();

        if (status != null) {
          s = ss.Where(x => x.ID == status.Value).FirstOrDefault();
          if (s != null) {
            statName = ("статусу '" + s.NAME + "'" ?? "");
          }
        }

        string filename = "/Content/" + "Сопровождение по " + statName + ".xlsx", document = Server.MapPath("~" + filename);

        if (System.IO.File.Exists(document)) {
          System.IO.File.Delete(document);
        }

        // запрашиваем данные
        List<SoprData> sd = new List<SoprData>();
        var data = GetSopr(1, 1000000, (status ?? 0), null, null, null, null);
        sd = JsonConvert.DeserializeObject<List<SoprData>>(data.Content);

        XLWorkbook wb = new XLWorkbook();
        IXLWorksheet ws = wb.Worksheets.Add("Книга 1");

        ws.PageSetup.PageOrientation = XLPageOrientation.Landscape;
        ws.PageSetup.Margins.Top = 0.1;
        ws.PageSetup.Margins.Bottom = 0.1;
        ws.PageSetup.Margins.Left = 0.1;
        ws.PageSetup.Margins.Right = 0.1;
        ws.PageSetup.Margins.Footer = 0.1;
        ws.PageSetup.Margins.Header = 0.1;

        ws.Column(1).Width = 2;
        ws.Column(2).Width = 5;
        ws.Column(3).Width = 10;
        ws.Column(4).Width = 40;
        ws.Column(5).Width = 17;
        ws.Column(6).Width = 15;
        ws.Column(7).Width = 8;
        ws.Column(8).Width = 11;
        ws.Column(9).Width = 14;
        ws.Column(10).Width = 9;
        ws.Column(11).Width = 15;
        ws.Column(12).Width = 12;
        ws.Column(13).Width = 20;
        ws.Column(14).Width = 20;

        try {

          int i = 2, index = 2;

          SetStringCell(ws, index, i, "№");
          SetStringCell(ws, index, i+1, "Дата");
          SetStringCell(ws, index, i+2, "ФИО");
          SetStringCell(ws, index, i+3, "Телефон");
          SetStringCell(ws, index, i+4, "Источник");
          SetStringCell(ws, index, i+5, "Продукт");
          SetStringCell(ws, index, i+6, "Доп. услуги");
          SetStringCell(ws, index, i+7, "Форма оплаты");
          SetStringCell(ws, index, i+8, "Статус");
          SetStringCell(ws, index, i+9, "Кол-во визитов");

          if (status != null) {
            if (status.Value == 1) {
              SetStringCell(ws, index, i + 10, "Последний визит");
            } else {
              SetStringCell(ws, index, i + 10, "Дата работы");
            }
          } else {
            SetStringCell(ws, index, i + 10, "Дата работы");
          }

          SetStringCell(ws, index, i + 11, "Комментарии");
          SetStringCell(ws, index, i + 12, "Задача");

          index++;

          foreach (var item in sd) {
            SetStringCell(ws, index, i, (item.RN.Value.ToString() ?? ""));

            DateTime? dt = new DateTime();
            dt = item.DATE_REG;

            if (dt == null) {
              SetStringCell(ws, index, i + 1, (""));
            } else {
              SetStringCell(ws, index, i + 1, dt.Value.ToString("dd.MM.yyyy", CultureInfo.InvariantCulture));
            }

            SetStringCell(ws, index, i + 2, (item.FIO ?? ""));
            SetStringCell(ws, index, i + 3, (item.PHONE ?? ""));
            SetStringCell(ws, index, i + 4, (item.IST ?? ""));

            var prod = sp.Where(x => x.ID == item.M_SOPR_PRODUCT_ID).FirstOrDefault();
            if (prod != null) {
              prodName = (prod.NAME ?? "");
            } else {
              prodName = "";
            }

            SetStringCell(ws, index, i + 5, prodName);

            var dop = sdp.Where(x => x.ID == item.M_SOPR_DOP_ID).FirstOrDefault();
            if (dop != null) {
              dopName = (dop.NAME ?? "");
            } else {
              dopName = "";
            }

            SetStringCell(ws, index, i + 6, dopName);

            var form = sf.Where(x => x.ID == item.M_SOPR_FORM_OPL_ID).FirstOrDefault();
            if (form != null) {
              formOplName = (form.NAME ?? "");
            } else {
              formOplName = "";
            }

            SetStringCell(ws, index, i + 7, formOplName);

            var stat = ss.Where(x => x.ID == item.M_SOPR_STATUS_ID).FirstOrDefault();
            if (stat != null) {
              statName = (stat.NAME ?? "");
            } else {
              statName = "";
            }

            SetStringCell(ws, index, i + 8, statName);

            int? visits = item.VISITS;
            if (visits == null) {
              SetStringCell(ws, index, i + 9, "");
            } else {
              SetStringCell(ws, index, i + 9, visits.Value.ToString());
            }

            if (status != null) {
              if (status.Value == 1) {
                dt = item.LAST_VISIT;
                ws.Column(12).Width = 16;
              } else {
                dt = item.DATE_WORK;
              }
            } else {
              dt = item.DATE_WORK;
            }

            if (dt == null) {
              SetStringCell(ws, index, i + 10, "");
            } else {
              SetStringCell(ws, index, i + 10, dt.Value.ToString("dd.MM.yyyy", CultureInfo.InvariantCulture));
            }

            SetStringCell(ws, index, i + 11, (item.COMMENT ?? ""));
            SetStringCell(ws, index, i + 12, (item.ZADACHA ?? ""));

            index++;
          }

          wb.SaveAs(document);
          wb.Dispose();
        } catch (Exception e) {
          var mess = e.Message;
          wb.Dispose();
        }

        return Json(new { file = filename });
      }
    }

    public static IXLCell SetStringCell(IXLWorksheet ws, int index, int i, string cellValue) {
      var cell = ws.Cell(index, i);
      cell.Value = cellValue;
      cell.Style.Border.TopBorder = XLBorderStyleValues.Thin;
      cell.Style.Border.BottomBorder = XLBorderStyleValues.Thin;
      cell.Style.Border.LeftBorder = XLBorderStyleValues.Thin;
      cell.Style.Border.RightBorder = XLBorderStyleValues.Thin;
      cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
      return cell;
    }

    // получить справочник Типы шаблонов для автоматической рассылки СМС
    [HttpGet]
    public ContentResult GetM_SMS_TEMPLATE_TYPE() {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from item in db.M_SMS_TEMPLATE_TYPE select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    // получить шаблон для автоматической рассылки СМС по выбранному типу
    [HttpGet]
    public ContentResult GetTemplateData(int? ID) {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = db.M_SMS_TEMPLATE.Where(x => x.M_SMS_TEMPLATE_TYPE_ID == ID && x.M_ORG_ID == uc.M_ORG_ID).FirstOrDefault();
        return Content(JsonConvert.SerializeObject(d), "application/json");
      }
    }

    [HttpPost]
    // сохранить шаблон для автоматической рассылки СМС
    public ActionResult SaveSmsTemplateData(M_SMS_TEMPLATE t) {
      UserContext uc = GetUserContext();
      using (ATLANTEntities db = new ATLANTEntities()) {
        if (t.ID != 0) {
          var a = db.M_SMS_TEMPLATE.Find(t.ID);
          if (a != null) {
            db.Entry(a).CurrentValues.SetValues(t);
          }
        } else {
          t.M_ORG_ID = uc.M_ORG_ID;
          db.M_SMS_TEMPLATE.Add(t);
        }
        db.SaveChanges();
      }
      return Json(new { success = true });
    }

    // получение полного справочника виды обрудования
    [HttpGet]
    public ContentResult GetM_PRODUCT_ALL() {
      using (ATLANTEntities db = new ATLANTEntities()) {
        var d = from item in db.M_PRODUCT select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }


    // получение справочника типы обрудования, выбранные для данного салона
    [HttpGet]
    public ContentResult GetM_PRODUCT_ORG() {
      using (ATLANTEntities db = new ATLANTEntities()) {
        UserContext uc = GetUserContext();
        var d = from item in db.M_PRODUCT_ORG.Where(x => x.M_ORG_ID == uc.M_ORG_ID) select item;
        return Content(JsonConvert.SerializeObject(d.ToList()), "application/json");
      }
    }

    [HttpPost]
    // сохранить выбранный товар для организации
    public JsonResult SaveProductDeistv(int? ID, int? DEISTV) {
      UserContext uc = GetUserContext();

      using (ATLANTEntities db = new ATLANTEntities()) {
        var o = db.M_PRODUCT_ORG.Where(x => x.M_ORG_ID == uc.M_ORG_ID).ToList();

        if (o != null) {
          var p = o.Where(x => x.M_PRODUCT_ID == ID).FirstOrDefault();
          if (p == null) {
            M_PRODUCT_ORG m = new M_PRODUCT_ORG();
            m.M_ORG_ID = uc.M_ORG_ID;
            m.M_PRODUCT_ID = ID;
            db.M_PRODUCT_ORG.Add(m);
          } else {
            if (DEISTV.Value == 0) {
              db.M_PRODUCT_ORG.Remove(p);
            }
          }
        } else {
          M_PRODUCT_ORG m = new M_PRODUCT_ORG();
          m.M_ORG_ID = uc.M_ORG_ID;
          m.M_PRODUCT_ID = ID;
          db.M_PRODUCT_ORG.Add(m);
        }
        db.SaveChanges();
      }
      return Json(new { success = true });
    }

    [HttpPost]
    // сохранить выбранный товар для организации
    public JsonResult SaveProductIsAbon(int? ID, int? IS_ABON) {
      using (ATLANTEntities db = new ATLANTEntities()) {
        if (ID.Value != 0) {
          M_PRODUCT bd = new M_PRODUCT();
          var m = db.M_PRODUCT.Find(ID);
          bd = m;
          bd.IS_ABON = IS_ABON.Value;
          db.Entry(m).CurrentValues.SetValues(bd);
        }
        db.SaveChanges();
      }
      return Json(new { success = true });
    }



    [HttpPost]
    public ActionResult DopUslDecrement(GetRegListDopUslViewModel dopUsl) {

      UserContext uc = GetUserContext();
      DateTime now = CreateDate();
      using(ATLANTEntities db = new ATLANTEntities()) {
        O_ABON_DOP_USL_IZM izm = 
          db.O_ABON_DOP_USL_IZM
            .Where(x => x.D_IZM == now.Date & x.O_SKLAD_RAS_PRODUCT_ID == dopUsl.O_SKLAD_RAS_PRODUCT_ID)
            .FirstOrDefault()
        ;
        if (izm == null) {
          izm = new O_ABON_DOP_USL_IZM() {
            ID = db.Database.SqlQuery<int>("select cast(next value for dbo.SQ_O_ABON_DOP_USL_IZM_ID as int) ID").First(),
            D_START = now,
            D_MODIF = null,
            M_ORG_ID = uc.M_ORG_ID,
            USERID = uc.ID,
            O_ANK_ID = dopUsl.O_ANK_ID,
            O_SKLAD_RAS_PRODUCT_ID  = dopUsl.O_SKLAD_RAS_PRODUCT_ID,
            D_IZM = now.Date
          };
          db.O_ABON_DOP_USL_IZM.Add(izm);

          O_SKLAD_RAS_PRODUCT pr = db.O_SKLAD_RAS_PRODUCT.Find(dopUsl.O_SKLAD_RAS_PRODUCT_ID);
          if (pr == null) {
            return HttpNotFound("Couldn't find O_SKLAD_RAS_PRODUCT.ID == " + dopUsl.O_SKLAD_RAS_PRODUCT_ID);
          }

          pr.D_MODIF = now;
          pr.KOLVO_POS = pr.KOLVO_POS - 1;
          pr.M_ORG_ID = uc.M_ORG_ID;
          pr.USERID = uc.ID;

        }

        db.SaveChanges();

        // получаю список всех доп-услуг по посетителю и ищу ту, которую обновлял
        GetRegListDopUslViewModel dopUslAfterUpdate = 
          GetRegListDopUsl(db, dopUsl.O_ANK_ID, uc.M_ORG_ID)
            .Where(x => x.O_SKLAD_RAS_PRODUCT_ID == dopUsl.O_SKLAD_RAS_PRODUCT_ID)
            .FirstOrDefault()
        ;


        return Content(JsonConvert.SerializeObject(dopUslAfterUpdate), "application/json");

      }

    }


    // есть ли абонемент какой-нибудь, даже если он не действующий
    public bool execHAS_ABON(int o_ank_id) {

      using(ATLANTEntities db = new ATLANTEntities()) {
        SqlParameter pO_ank_id = new SqlParameter("@o_ank_id", SqlDbType.Int);
        pO_ank_id.Value = o_ank_id;

        int cnt = db.Database.SqlQuery<int>("exec dbo.[HAS_ABON] @o_ank_id = @o_ank_id;", pO_ank_id).First();

        return cnt > 0;
      }

    }


  } // /public class HomeController:Controller

}