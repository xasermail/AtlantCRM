using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace AtlantCRM.Models {

  public class O_ANK_ZABOLViewModel {
    public int ID { get; set; }
    public int O_ANK_ID { get; set; }
    public int M_ZABOL_ID { get; set; }
    public String M_ZABOL_NAME { get; set; }
  }

  public class O_ANKViewModel {

    public int ID { get; set; }
    public string SURNAME { get; set; }
    public string NAME { get; set; }
    public string SECNAME { get; set; }
    public Nullable<short> SEX { get; set; }
    public Nullable<System.DateTime> BIRTHDAY { get; set; }
    public string PHONE_MOBILE { get; set; }
    public string PHONE_HOME { get; set; }
    public string REGION { get; set; }
    public string CITY { get; set; }
    public string STREET { get; set; }
    public string HOUSE { get; set; }
    public string FLAT { get; set; }
    public string CORPUS { get; set; }
    public string DISTRICT { get; set; }
    public string POST_INDEX { get; set; }
    public Nullable<short> IST_INFO { get; set; }
    public Nullable<int> FIO_INFO_ID { get; set; }
    public string fio_reg { get; set; }
    public Nullable<System.DateTime> DATE_REG { get; set; }
    public byte[] PHOTO { get; set; }
    public int USER_REG { get; set; }
    public int VIP { get; set; }
    public int IST_INFO_USERID { get; set; }

    public IEnumerable<O_ANK_ZABOLViewModel> O_ANK_ZABOL {get; set; }
    // для отображения ФИО посетителя, из Источника информации
    public string FIO_INFO_ID_NAME { get; set; }
    // если зарегистрирован уже сегодня, то тут будет сообщение информационное
    // об этом и время регистрации
    public string reg_status { get; set; }
    // если из Анкеты регистрация, но он не новенький или новенький, но
    // уже зарегистрированный - тут будет соответствующая ошибка
    public string reg_error { get; set; }
    // штрих-код
    public int ID_CODE { get; set; }

  }

  public class NameCodeViewModel {

    public string name { get; set; }
    public string code { get; set; }
   
  }

  public class ValueDisplayViewModel {

    public int value { get; set; }
    public string display { get; set; }
   
  }

  public class IdValueViewModel {

    public int id { get; set; }
    public string value { get; set; }
   
  }

  public class GetKontSearchListViewModel {

    public int id { get; set; }
    public string value { get; set; }
    public DateTime? date { get; set; }
    // KONT - из Контактов, REK - из Рекомендованных
    public string KontOrRek { get; set; }
    // 1 - из списка Не пришедших
    public int NEPR { get; set; }

  }

  public class RegViewModel {
    // признак успешности запроса
    public bool success { get; set; }
    // код ошибки, если будет
    public int errCode { get; set; }
    // текст ошибки, если будет
    public string err { get; set; }
    public int O_ANK_ID { get; set; }
    public int M_SEANS_TIME_ID { get; set; }
    public string surname { get; set; }
    public string name { get; set; }
    public string secname { get; set; }
    public string seans_current_info { get; set; }
    public int min_time_minutes { get; set; }
    public int zapolnennost { get; set; }
    public string spetsialist { get; set; }
    public int seansCount {get; set; }
    public IEnumerable<TimeOborViewModel> seansList { get; set; }
    public IEnumerable<NameViewModel> tovarList { get; set; }
    public int IS_GOST { get; set; }

  }

  public class TimeOborViewModel {

    public string time { get; set; }
    public string place { get; set; }

  }

  public class NameViewModel {
    public string name { get; set; }
  }

  public class OrgTreeViewModel {
    public int ID { get; set; }
    public string NAME { get; set; }
    public int M_ORG_TYPE_ID { get; set; }
    public string M_ORG_TYPE_ID_NAME { get; set; }
    public int DEISTV { get; set; }
    public IList<OrgTreeViewModel> childs;
  }
    /// <summary>
    /// ViewModel строки отчета за день
    /// </summary>
    public class ReportDayRowViewModel
    {

        /// <summary>
        /// Ид сеанса
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Сеанс
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Новый
        /// </summary>
        public int CountNew { get; set; }

        /// <summary>
        /// первы ряд
        /// </summary>
        public int FirstRyad { get; set; }

        /// <summary>
        /// Второй ряд
        /// </summary>
        public int SecondRyad { get; set; }

        /// <summary>
        /// Родненькие
        /// </summary>
        public int CountOld { get; set; }

        /// <summary>
        /// Всего
        /// </summary>
        public int CountAll { get; set; }

        /// <summary>
        /// Наполненность
        /// </summary>
        public int Fullness { get; set; }

        /// <summary>
        /// ЗАписалось на следующий день
        /// </summary>
        public int RecordForTommorrow { get; set; }

       /// <summary>
       /// Разница со следующим днем
       /// </summary>
        public int DifferentForTommorrow { get; set; }
        
        /// <summary>
        /// Разница с предыдущим днем
        /// </summary>
        public int DifferentForYesterday { get; set; }
    }

    /// <summary>
    /// Строка для отчета День
    /// </summary>
    public class ReportDayRow
    {
        /// <summary>
        /// Идентификатор сеанаса
        /// </summary>
        public int SEANS_TIME_ID { get; set; }
        /// <summary>
        /// Текстовое описание сеанса
        /// </summary>
        public string SEANS_TIME_NAME { get; set; }
        /// <summary>
        /// Идентификатор ряда
        /// </summary>
        public int RYAD_ID { get; set; }
        /// <summary>
        /// Текстовое описание ряда
        /// </summary>
        public string RYAD_NAME { get; set; }
        /// <summary>
        /// всего людей в ряду
        /// </summary>
        public int ALL_ANK { get; set; }
        /// <summary>
        /// Всего новых
        /// </summary>
        public int All_NEW { get; set; }
        /// <summary>
        /// Всего "родненьких"
        /// </summary>
        public int All_OLD { get; set; }
        /// <summary>
        /// Разница со следующим днем
        /// </summary>
        public int DIFERENT_FOR_TOMMORROW { get; set; }
        /// <summary>
        /// Количество людей на завтра
        /// </summary>
        public int RECORD_FOR_TOMMORROW { get; set; }
        /// <summary>
        /// Разница со следующим днем
        /// </summary>
        public int DIFERENT_FOR_YESTERDAY { get; set; }
    }

    /// <summary>
    /// Строка отчета день для отображения
    /// </summary>
    public class ReportDayRowShowViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int RecordForTommorrow { get; set; }
        public int CountNew { get; set; }
        public int FirstRyad { get; set; }
        public int SecondRyad { get; set; }
        public int CountOld { get; set; }
        public int CountAll { get; set; }
        public decimal Napol { get; set; }
        public int DifferentForYesterday { get; set; }
        public int DifferentForTommorrow { get; set; }
    }
 

    /// <summary>
    /// Для отображения количетсвенных показателей дня по людям
    /// </summary>
    public class GetStatCountViewModel
    {
        /// <summary>
        /// записалось
        /// </summary>
        public int Record { get; set; }
        
        /// <summary>
        /// пришло
        /// </summary>
        public int Came { get; set; }
        
        /// <summary>
        /// не пришло
        /// </summary>
        public int NotCame { get; set; }

        /// <summary>
        /// новенькие
        /// </summary>
        public int New { get; set; }
        
        /// <summary>
        /// ушли и не записались
        /// </summary>
        public int NotRecord { get; set; }
        
        /// <summary>
        /// Без регистрации
        /// </summary>
        public int NotReg { get; set; }
    }

    /// <summary>
    /// ViewModel для отчета
    /// </summary>
    public class ReportDayViewModel
    {
        /// <summary>
        /// Данные отчета
        /// </summary>
        public List<ReportDayRowShowViewModel> Data { get; set; }
        /// <summary>
        /// Численные статусы
        /// </summary>
        public GetStatCountViewModel CountState { get; set; }
        /// <summary>
        /// Разница со следущим днем
        /// </summary>
        public int DifferentForTommorow { get; set; }
        /// <summary>
        /// разница с предыдущим днем
        /// </summary>
        public int DifferentForYesterday { get; set; }
  }

    public class RegSeansPlace {
      public int ID {get; set;}
      public string NAME {get; set;}
      public int zanyato {get; set;}
      public int zanyato_kolvo {get; set;}
      public int M_SEANS_TIME_ID {get; set;}
      public int M_RYAD_ID {get; set;}
    }


    /// <summary>
    /// Краткая информация по анкете (ФИО, телефон)
    /// </summary>
    public class ShortAnkInfo
    {
        /// <summary>
        /// Фамилия Имя Отчество
        /// </summary>
        public string FIO { get; set; }
        
        /// <summary>
        /// Телефон
        /// </summary>
        public string Phone { get; set; }
    }

    /// <summary>
    /// Ушли и не записались
    /// </summary>
    public class NotRecordViewModel
    {
        /// <summary>
        /// Фамилия Имя Отчество
        /// </summary>
        public string FIO { get; set; }

        /// <summary>
        /// Телефон
        /// </summary>
        public string Phone { get; set; }

        /// <summary>
        /// Время регистрации
        /// </summary>
        public string TimeReg { get; set; }

        /// <summary>
        /// Время на ряду
        /// </summary>
        public string TimeInRyad { get; set; }

        /// <summary>
        /// Кто общался на первом ряду
        /// </summary>
        public string WhoSpokeInFirstRyad { get; set; }

        /// <summary>
        /// Кто общался на втором ряду
        /// </summary>
        public string WhoSpokeInSecondRyad { get; set; }

    }

    /// <summary>
    /// Не зарегистрировались
    /// </summary>
    public class NotRegViewModel
    {
        /// <summary>
        /// ФИО
        /// </summary>
        public string FIO { get; set; }

        /// <summary>
        /// Телефон
        /// </summary>
        public string Phone { get; set; }

        /// <summary>
        /// Регистрация
        /// </summary>
        public string Reg { get; set; }

        /// <summary>
        /// Первый ряд
        /// </summary>
        public string FirstRyad { get; set; }

        /// <summary>
        /// Второй ряд
        /// </summary>
        public string SecondRyad { get; set; }
    }

    /// <summary>
    /// VM для отображения контакта
    /// </summary>
    public class KontSeansAndAnkViewModel
    {
        /// <summary>
        /// Идентификатор записи на сеанс
        /// </summary>
        public int KontSeansID { get; set; }
        
        /// <summary>
        /// Идентификатор времени сеанса
        /// </summary>
        public int SeansTimeID { get; set; }
       
        /// <summary>
        /// Идентификтор контакта
        /// </summary>
        public int KontId { get; set; }
       
        /// <summary>
        /// ФИО контакта
        /// </summary>
        public string FIO { get; set; }
       
        /// <summary>
        /// Телефон
        /// </summary>
        public string Phone  { get; set; }

        /// <summary>
        /// Признак того что данные должны быть отображены
        /// </summary>
        public bool Shown { get; set; }

        /// <summary>
        /// Фамилия
        /// </summary>
        public string SURNAME  { get; set;} 
        /// <summary>
        /// Имя
        /// </summary>
        public string NAME { get; set;} 
        /// <summary>
        /// Отчетство
        /// </summary>
        public string SECNAME { get; set;} 
        /// <summary>
        /// Статус контакта
        /// </summary>
        public int M_KONT_STATUS_ID { get; set; }
        /// <summary>
        /// Источник контакта
        /// </summary>
        public int M_KONT_IST_ID { get; set; }
        /// <summary>
        /// Признак того, что Контакт скрыт из общего режима Запись
        /// </summary>
        public int SKR_IZ_RECORD { get; set; }
        /// <summary>
        /// Список комментариев к сеансу
        /// </summary>
        public List<O_KONT_SEANS_COMMENT> O_KONT_SEANS_COMMENTList { get; set; }
        
  }

  /// <summary>
  /// Отображение не пришедшего контакта
  /// </summary>
  public class KontNotCameViewModel
  {
    /// <summary>
    /// Идентификатор сеанса контакта
    /// </summary>
    public int KONT_SEANS_ID { get; set; }
    /// <summary>
    /// Идентификатор котакта
    /// </summary>
    public int KONT_ID  { get; set; }
    /// <summary>
    /// Фамилия
    /// </summary>
    public string SURNAME { get; set; }
    /// <summary>
    /// Имя
    /// </summary>
    public string NAME { get; set; }
    /// <summary>
    /// Отчетство
    /// </summary>
    public string SECNAME { get; set; }
    /// <summary>
    /// Телефон
    /// </summary>
		public string PHONE { get; set; }
    /// <summary>
    /// Сеанс
    /// </summary>
    public string SEANS { get; set; }
    /// <summary>
    /// Дата звонка
    /// </summary>
    public DateTime? D_ZV { get; set; }
    /// <summary>
    /// Коментарий
    /// </summary>
    public string COMMENT { get; set; }
    /// <summary>
    /// Идентификатор времени сеанса, может быть null для Не пришедших, созданных из интерфейса
    /// </summary>
    public int? M_SEANS_TIME_ID { get; set; }
    /// <summary>
    /// Редим видимости
    /// </summary>
    public int SKR { get; set; }
    /// <summary>
    /// Общее количество записей
    /// </summary>
    public int COUNT_ALL { get; set; }
    /// <summary>
    /// Статус контакта
    /// </summary>
    public int M_KONT_STATUS_ID { get; set; }
    /// <summary>
    /// Источник контакта
    /// </summary>
    public int M_KONT_IST_ID { get; set; }
    /// <summary>
    /// Статус контакта (наименование)
    /// </summary>
    public string M_KONT_STATUS_ID_NAME { get; set; }
    /// <summary>
    /// Источник контакта (наименование)
    /// </summary>
    public string M_KONT_IST_ID_NAME { get; set; }
    /// <summary>
    /// Список комментариев к сеансу
    /// </summary>
    public List<O_KONT_SEANS_COMMENT> O_KONT_SEANS_COMMENTList { get; set; }
  }


    public class BazaListViewModel {
      public int id { get; set; }
      public int kod { get; set; }
      public string fio { get; set; }
      public DateTime? birthday { get; set; }
      public string phone { get; set; }
      public int visit_count { get; set; }
      public DateTime? last_visit { get; set; }
      public DateTime? last_sale { get; set; }
      public string reg_fio { get; set; }
      public int is_registered_today { get; set; }
      public int cnt { get; set; }
      public int? uluch_day_id { get; set; }
      public DateTime? d_start_last_zv {get; set;}
      public string fio_last_zv {get; set;}
      public string comment_last_zv {get; set;}
      public Int16? sex { get; set; }
    }

    /// <summary>
    /// Данные отчет Статистика
    /// </summary>
    public class ReportStatisticViewModel
    {
        /// <summary>
        /// Общее количество посетителей
        /// </summary>
        public int ALL_COUNT { get; set; }
        /// <summary>
        /// Средний возраст
        /// </summary>
        public int AVG_AGE { get; set; }
        /// <summary>
        /// Диапозон возраста
        /// </summary>
        public string RANGE_AGE { get; set; }
        /// <summary>
        /// Наиболее распространенный возраст
        /// </summary>
        public int POPULAR_AGE { get; set; }
        /// <summary>
        /// Соотношение М/Ж
        /// </summary>
        public string RATIO_MAN_AND_WOMAN { get; set; }
        /// <summary>
        /// Сколько знают
        /// </summary>
        public int ZNAUT { get; set; }
        /// <summary>
        /// Продажи БХМ
        /// </summary>
        public int SALE_BHM { get; set; }
        /// <summary>
        /// Продажи МХМ
        /// </summary>
        public int SALE_MHM { get; set; }
        /// <summary>
        /// Продажи Проектор
        /// </summary>
        public int SALE_PROECTOR { get; set; }
        /// <summary>
        /// Общее число продаж
        /// </summary>
        public int ALL_COUNT_SALE { get; set; }
    }

    /// <summary>
    /// Строка для отчета Специалисты
    /// </summary>
    public class RowReportSpecialistViewModel
    {
      /// <summary>
      /// Идентификатор сотрудника
      /// </summary>
      public int USERID { get; set; }
      /// <summary>
      /// Фио
      /// </summary>
      public string FIO { get; set; }
      /// <summary>
      /// Друзья
      /// </summary>
      public int FRIENDS { get; set; }
      /// <summary>
      /// Анкеты
      /// </summary>
      public int ANKETS { get; set; }
      /// <summary>
      /// Общение
      /// </summary>
      public int DIALOG { get; set; }
      /// <summary>
      /// Записал
      /// </summary>
      public int KONTACTS { get; set; }
      /// <summary>
      /// Пришло
      /// </summary>
      public int CAME { get; set; }
      /// <summary>
      /// Не пришло
      /// </summary>
      public int NOT_CAME { get; set; }
      /// <summary>
      /// %
      /// </summary>
      public int PERCENT { get; set; }
      /// <summary>
      /// Купил
      /// </summary>
      public int BUY { get; set; }
      /// <summary>
      /// Кол-во звонков
      /// </summary>
      public int COUNT_CALL { get; set; }
    }

    /// <summary>
    /// Строка для отчета Заболевания
    /// </summary>
    public class RowReportZabolViewModel 
    {
      /// <summary>
      /// Название заболевания
      /// </summary>
      public string ZABOL_NAME { get; set; }
      /// <summary>
      /// Количество людей
      /// </summary>
      public int ZABOL_COUNT { get; set; }
    }

  /// <summary>
  /// Строка отчета источники
  /// </summary>
  public class RowReportInstViewModel
  {
    /// <summary>
    /// Название источника
    /// </summary>
    public string NAME { get; set; }
    /// <summary>
    /// Количество анкет
    /// </summary>
		public int COUNT_ANK { get; set; }
		/// <summary>
    /// Продажи
    /// </summary>
    public int SALE { get; set; }
  }

  /// <summary>
  /// Строка отчета Дни рождения
  /// </summary>
  public class RowReportBirthday
  {
    /// <summary>
    /// Идентификатор анкеты
    /// </summary>
    public int ANK_ID { get; set; }
		/// <summary>
    /// Фамилия
    /// </summary>
    public string SURNAME { get; set; }	
		/// <summary>
    /// Имя
    /// </summary>
    public string NAME { get; set; }	
		/// <summary>
    /// Отчество
    /// </summary>
    public string SECNAME { get; set; }
		/// <summary>
    /// День рождения
    /// </summary>
    public DateTime BIRTHDAY { get; set; }	
    /// <summary>
    /// Возраст
    /// </summary>
    public int AGE { get; set; }
    /// <summary>
    /// Дней осталось
    /// </summary>
    public int DAYS_LEFT { get; set; }
    /// <summary>
    /// Товаров
    /// </summary>
    public int PRODUCT_COUNT { get; set; }
    /// <summary>
    /// возвонить
    /// </summary>
    public bool CALL { get; set; }
  }

  
  public class O_SKLAD_RAS_PRODUCTViewModel: O_SKLAD_RAS_PRODUCT {
    public IList<O_SKLAD_RAS_PRODUCT_OPL> o_sklad_ras_product_opl { get; set; }
  }



  public class RasProdViewModel {
    public O_SKLAD_RAS_PRODUCT o_sklad_ras_product { get; set; }
    public IList<O_SKLAD_RAS_PRODUCT_OPL> o_sklad_ras_product_opl { get; set; }
    public O_ABON_PRIOST o_abon_priost { get; set; }
  }

  public class KassOrderViewModel {
    public string m_org_name { get; set; }
    public string n_schet { get; set; }
    public DateTime? d_schet { get; set; }
    public string o_ank_surname { get; set; }
    public string o_ank_name { get; set; }
    public string o_ank_secname { get; set; }
    public string m_product_name { get; set; }
    public int? summa_rub { get; set; }
    public int? summa_kop { get; set; }
    public string s_user_surname { get; set; }
    public string summa_propisyu { get; set; }
    public decimal? summa { get; set; }
  }


 
  public class ProplZaPerViewModel {
    public string fio { get; set; }
    public string product_name { get; set; }
    public decimal? opl { get; set; }
    public DateTime? d_vid { get; set; }
    public string phone_mobile { get; set; }
    
  }


  public class DialogProductStatusViewModel {
    public string product_name { get; set; }
    public DateTime? d_last_opl { get; set; }
    public int o_sklad_ras_id { get; set; }
  }

  public class DialogProductViewModel {
    public string product_name { get; set; }
    public DateTime? d_vid { get; set; }
    public int o_sklad_ras_id { get; set; }
    public int is_abon { get; set; }
    public int ostalos { get; set; }
    public DateTime? d_deistv { get; set; }
    public string abonDeistvSPo { get; set; }
  }


  public class UchetReportsOtchetZaPerViewModel {
    public string month_name { get; set; }
    public decimal? tovaroob { get; set; }
    public decimal? sebest { get; set; }
    public decimal? brutto_pr { get; set; }
    public decimal? rashod { get; set; }
    public decimal? chist_pr { get; set; }
    public decimal? rent { get; set; }
  }

  /// <summary>
  /// VM строки Учет - Отчеты - Фильтр товаров
  /// </summary>
  public class UchetReportsFilterTovarovViewModel {
    /// <summary>
    /// Идентификатор расхода
    /// </summary>
    public int O_SKLAD_RAS_ID { get; set; }
    /// <summary>
    /// Дата
    /// </summary>
    public DateTime D_SCHET { get; set; }
    /// <summary>
    /// Идентификатор товара
    /// </summary>
    public int M_PRODUCT_ID { get; set; }
    /// <summary>
    /// название товара
    /// </summary>
    public string PRODUCT_NAME { get; set; }
    /// <summary>
    /// идентификатор анкеты покупателя
    /// </summary>
    public int? O_ANK_ID { get; set; }
    /// <summary>
    /// фамилия покупателя
    /// </summary>
    public string SURNAME_POKUP { get; set; }
    /// <summary>
    /// имя покупателя
    /// </summary>
    public string NAME_POKUP { get; set; }
    /// <summary>
    /// отчетсво покупателя
    /// </summary>
    public string SECNAME_POKUP { get; set; }
    /// <summary>
    /// цена
    /// </summary>
    public decimal COST { get; set; }
    /// <summary>
    /// телефон
    /// </summary>
    public string PHONE_MOBILE { get; set; }
    /// <summary>
    /// продавец
    /// </summary>
    public int? S_USER_ID { get; set; }
    /// <summary>
    /// фамилия продавца
    /// </summary>
    public string SURNAME_SPECIALIST { get; set; }
    /// <summary>
    /// имя продавца
    /// </summary>
    public string NAME_SPECIALIST { get; set; }
    /// <summary>
    /// отчество продавца
    /// </summary>
    public string SECNAME_SPECIALIST { get; set; }
    /// <summary>
    /// Всего записей
    /// </summary>
    public int COUNT_ALL { get; set; }
    /// <summary>
    /// Осталось (количество отавшихся дней последнего абонемента)
    /// </summary>
    public int ostalos_dn_abon { get; set; }
  }


  public class OtchetBuhDataViewModel {
    public Decimal TOVAROOB { get; set; }
    public Decimal SEBEST { get; set; }
    public Decimal BRUTTO_PR { get; set; }
    public Decimal RASHOD { get; set; }
    public Decimal CHIST_PR { get; set; }
    public Decimal RENT { get; set; }
    public Decimal VALOV_DOHOD { get; set; }
    public Decimal TOCHKA_BEZUB { get; set; }
  }


  public class ZarplFioViewModel: O_ZARPL_FIO {
    public string fio { get; set; }
 
  }


  public class RasDokNameRashod {
    public string NAME {get; set;}
    public Decimal RASHOD {get; set;}
  }

  
  public class O_DILER_A_SKLADViewModel: O_DILER_A_SKLAD {
    public string M_PRODUCT_NAME {get; set;}
  }
  
  public class O_DILER_C_SKLADViewModel: O_DILER_A_SKLAD {
    public string M_PRODUCT_NAME {get; set;}
  }

  public class O_DILER_A_PRICEViewModel: O_DILER_A_PRICE {
    public string M_PRODUCT_TOVAR_ID_NAME {get; set;}
  }

  public class KartaViewModel {
    public decimal? lg { get; set; }
    public decimal? lt { get; set; }
    public int? kolvo { get; set; }
    public bool error { get; set; }
  }


  public class KartaStatusViewModel {
    public int kolvo { get; set; }
    public string name { get; set; }
  }

  /// <summary>
  /// Статус вкладка База
  /// </summary>
  public class StatusClientViewModel
  {
    /// <summary>
    /// Идентификатор статуса
    /// </summary>
    public int M_STATUS_ID { get; set; }
    /// <summary>
    /// Описание статуса
    /// </summary>
    public string M_STATUS_NAME { get; set; }
    /// <summary>
    /// Количество анкет
    /// </summary>
    public int COUNT_ANK {get;set;}
  }

  /// <summary>
  /// Статусы по дням рождениям во вкладке База
  /// </summary>
  public class BirthdayReportViewModel
  { 
    /// <summary>
    /// Сегодня
    /// </summary>
    public int Today { get; set; }
    /// <summary>
    /// На этой неделе
    /// </summary>
    public int ThisWeek { get; set; }
    /// <summary>
    /// В жтом месяце
    /// </summary>
    public int ThisMonth { get; set; }
  }

  /// <summary>
  /// Запись о товаре для статуса в режиме База
  /// </summary>
  public class TovarStatusViewModel
  {
    /// <summary>
    /// Название товара
    /// </summary>
    public int TOVAR_ID { get; set; }

    /// <summary>
    /// Название товара
    /// </summary>
    public string TOVAR_NAME { get; set; }
    /// <summary>
    /// Количество товара
    /// </summary>
    public int COUNT { get; set; }
  }

  /// <summary>
  /// Запись об улучшениях для статуса в режиме База
  /// </summary>
  public class UluchStatusViewModel {
    /// <summary>
    /// Ид дня
    /// </summary>
    public int DAY_ID { get; set; }
    /// <summary>
    /// Название дня
    /// </summary>
    public string DAY_NAME { get; set; }
    /// <summary>
    /// Количество
    /// </summary>
    public int COUNT { get; set; }
  }

  /// <summary>
  /// Пол посетителя для статуса в режиме База
  /// </summary>
  public class SexStatusViewModel {
    /// <summary>
    /// Ид
    /// </summary>
    public int SEX_ID { get; set; }
    /// <summary>
    /// Название пола
    /// </summary>
    public string SEX_NAME { get; set; }
    /// <summary>
    /// Количество
    /// </summary>
    public int COUNT { get; set; }
  }

  /// <summary>
  /// Вкладка База левая понель со статусами
  /// </summary>
  public class BazaLeftBarViewModel
  {
    /// <summary>
    /// Раздел Статус
    /// </summary>
    public List<StatusClientViewModel> Statuses { get; set; }
    /// <summary>
    /// Дни рождения
    /// </summary>
    public BirthdayReportViewModel Birthday { get; set; }
    /// <summary>
    /// Товары
    /// </summary>
    public List<TovarStatusViewModel> Tovars { get; set; }
    /// <summary>
    /// Улучшения
    /// </summary>
    public List<UluchStatusViewModel> Uluch { get; set; }
    /// <summary>
    /// Пол
    /// </summary>
    public List<SexStatusViewModel> Sex { get; set; }
  }

  /// <summary>
  /// VM'ль для уведомлений
  /// </summary>
  public class UvedomlViewModel
  { 
    /// <summary>
    /// Массив дат для отображения
    /// </summary>
    public UvedomnDateViewModel[] Dates { get; set; }
    /// <summary>
    /// Признак наличия данных
    /// </summary>
    public bool LoadData { get; set; }
	  /// <summary>
	  /// Заголовки (отображаемые дни)
	  /// </summary>
	  public UvedomnDayDetailsViewModel[] HeadersDate { get; set; }
	  /// <summary>
	  /// Данные
	  /// </summary>
	  public UvedomlItemViewModel[,] Data { get; set; }
    /// <summary>
    /// Не выполненные
    /// </summary>
    public UvedomlItemViewModel[] uvedomlList { get; set; }

    public int TotalPageCount { get; set; }
    public int CountAll { get; set; }
    /// <summary>
    /// Количетво запланированных
    /// </summary>
    public int CountUvedomlInShownWeek { get; set; }
  }

  public class UvedomnDateViewModel
  { 
    /// <summary>
    /// Дата
    /// </summary>
    public DateTime Date { get; set; }
    /// <summary>
    /// Количество уведобвлений
    /// </summary>
    public int CountUvedoml { get; set; }
    /// <summary>
    /// Признак предыдущего месяца
    /// </summary>
    public bool PrevMonth { get; set; }
    /// <summary>
    /// Признак текущего месяца
    /// </summary>
    public bool CurrentMonth { get; set; }
    /// <summary>
    /// Признак следущего месяца
    /// </summary>
    public bool NextMonth { get; set; }
    /// <summary>
    /// Выходной
    /// </summary>
    public bool Weekend { get; set; }
    /// <summary>
    /// Признак выбранного дня
    /// </summary>
    public bool Selected { get; set; }

    public bool NotExistUvedoml { get; set; }

    // признак первого дня месяца для отображения месяца и года
    public int FirstMonthDay { get; set; }
    public string MonthName { get; set; }
    public int Year { get; set; }

  }

	public class UvedomnDayDetailsViewModel
	{
		/// <summary>
		/// Дата
		/// </summary>
		public DateTime Date { get; set; }
		/// <summary>
		/// Признак выбранности
		/// </summary>
		public bool Selected { get; set; }
	}

	public class UvedomlItemViewModel
	{
    public int Uvedoml_ID { get; set; }
		public int M_VID_SOB_ID { get; set; }
		public string FIO { get; set; }
		public string Phone { get; set; }
    public DateTime Date { get; set; }
    public bool IsShown { get; set; }
    
    public int UserID { get; set; }
    /// <summary>
    /// Создавший уведомление
    /// </summary>
    public string UserName { get; set; }
    /// <summary>
    /// признак звонка
    /// </summary>
    public bool IsCall { get; set; }

    public bool IsEmpty { get; set; }

    /// <summary>
    /// Признак выполненности уведомления
    /// </summary>
    public bool IsPerform { get; set; }
    public string Comment { get; set; }
    public int? ANK_ID { get; set; }
    public int COUNT_ALL { get; set; }
    public string M_VID_SOB_ID_NAME { get; set; }
    public int GR { get; set; }
    // список комментариев для групповых уведомлений
    public List<O_UVEDOML_GR_COMMENTViewModel> GR_COMMENT_LIST { get; set; } = new List<O_UVEDOML_GR_COMMENTViewModel>();
    // ссылка на расход со склада
    public int? O_SKLAD_RAS_ID { get; set; }
    // ссылка на контакт
    public int? O_KONT_ANK_ID { get; set; }
  }

  public class O_UVEDOML_GR_COMMENTViewModel: O_UVEDOML_GR_COMMENT {
    public string USERID_NAME { get; set; }
  }

  public class DateCountUvedomlViewModel {
    public DateTime D_SOB { get; set; }
    public int CountUvedoml { get; set; }
  }


  public class GetReportMarketingYearsViewModel {
    public int id { get; set; }
    public int noviy { get; set; }
    public int seansi { get; set; }
    public int dni { get; set; }
    public int rodn { get; set; }
    public decimal vsego { get; set; }
    public decimal napoln { get; set; }
    public int prodaji { get; set; }
    public string tip { get; set; }
    public DateTime dt { get; set; }
    public int? week_number { get; set; }
    public int month_number { get; set; }
    public string name { get; set; }
  }

  /// <summary>
  /// Отчеты - Сервис строка
  /// </summary>
  public class ReportServiceRowViewModel
  {
    /// <summary>
    /// Идентификатор записи
    /// </summary>
    public int O_SERVICE_ID { get; set; } 
    /// <summary>
    /// Идентификатор анкеты человека 
    /// </summary>
		public int  O_ANK_ID { get; set; }  
		/// <summary>
    /// Фамилия клиента
    /// </summary>
    public string O_ANK_SURNAME  { get; set; } 
		/// <summary>
    /// Имя клиента
    /// </summary>
    public string O_ANK_NAME  { get; set; }  
		/// <summary>
    /// Отчество клиента
    /// </summary>
    public string O_ANK_SECNAME  { get; set; }  
		/// <summary>
    /// Идентифискатор товара
    /// </summary>
    public int M_PRODUCT_ID { get; set; }
		/// <summary>
    /// название новара
    /// </summary>
    public string PRODUCT_NAME { get; set; }
		/// <summary>
    /// Идентификатор состояния
    /// </summary>
    public int M_SERVICE_TYPE_ID { get; set; }
		/// <summary>
    /// Текстое предствавление состояния
    /// </summary>
    public string M_SERVICE_TYPE_NAME { get; set; }
		/// <summary>
    /// Прогназируемая дата завершения обслуживания
    /// </summary>
    public DateTime? DATE_TEH_OTDEL { get; set; }
		/// <summary>
    /// Дата записи
    /// </summary>
    public DateTime D_START { get; set; }  
  }

  /// <summary>
  /// Строка отчета Итог
  /// </summary>
  public class ReportItogRowViewModel
  {
    /// <summary>
    /// Значение
    /// </summary>
    public int VAL { get; set; }
    /// <summary>
    /// Количество сеансов
    /// </summary>
    public int COUNT_SEANS { get; set; }
    /// <summary>
    /// КОличество продаж
    /// </summary>
    public int COUNT_BUY { get; set; }
  }


  public class VipisViewModel {
    public int O_VIPIS_ID {get; set;}
    public int O_ANK_ID {get; set;}
    public int? M_ZABOL_GROUP_ID {get; set;}
    public string ZABOL_TEXT {get; set;}
    public string ULUCH_TEXT {get; set;}
    public List<int> oVipisUluch {get; set;} = new List<int>();
    public DateTime? D_ULUCH {get; set;}
    public string LINK { get; set; }
    public string LINK_POSLE { get; set; }
  }

  /// <summary>
  /// Элемнет для каендаря продаж
  /// </summary>
  public class SalesCalendarRowViewModel
  {
    public int ID { get; set; }
		public int O_ANK_ID { get; set; }
		public string SURNAME_CLIENT { get; set; }
		public string NAME_CLIENT { get; set; }
		public string SECNAME_CLIENT { get; set; }
		public int M_PRODUCT_ID { get; set; }
		public DateTime STATUS_DATE { get; set; }
		public int? USERID { get; set; }
		public string SURNAME_SPECIALIST { get; set; }
		public string NAME_SPECIALIST { get; set; }
		public string SECNAME_SPECIALIST { get; set; }
  }

  public class SaleCaldarDayViewModel
  {
    /// <summary>
    /// Принак пустого дня
    /// </summary>
    public bool EmptyDay { get; set; } 
    /// <summary>
    /// Дата
    /// </summary>
    public DateTime Date { get; set; }
    /// <summary>
    /// Выходной
    /// </summary>
    public bool Weekend { get; set; }
  }

  public class TovarForDaySaleCalendar
  {
    public TovarForDaySaleCalendar()
    {
      Posups = new List<PocupInfoSaleCalendar>();
    }
    /// <summary>
    /// Название товара
    /// </summary>
    public string NameTovar { get; set; }

    /// <summary>
    /// Количество покупок
    /// </summary>
    public int CountItem { get { return Posups.Count; } }

    /// <summary>
    /// Список покупателей
    /// </summary>
    public List<PocupInfoSaleCalendar> Posups { get; set; }
  }


  public class PocupInfoSaleCalendar
  {
    /// <summary>
    /// Индентификатор анкеты
    /// </summary>
    public int ANK_ID { get; set; }
    /// <summary>
    /// Фамилия
    /// </summary>
    public string SURNAME { get; set; }
    /// <summary>
    /// Имя
    /// </summary>
    public string NAME { get; set; }
    /// <summary>
    /// Отчество
    /// </summary>
    public string SECNAME { get; set; }
  }

  public class GetOpovListViewModel {
    public int O_OPOV_ID {get; set;}
    public int? O_ANK_ID { get; set; }
    public int TIP {get; set;}
    public int? O_SKLAD_RAS_ID {get; set;}
    public string caption {get; set;}
  }

  public class SkladRasUvedomlViewModel {
    // Добавить звонок (для нового пользовательского события)
    // тип события
    public int? m_vid_sob_id { get; set; }
    // дата
    public DateTime? d_sob { get; set; }
    // комментарий
    public string comment { get; set; }
    // /добавить звонок

    // признак того, что пользователем создано обязательное уведомление о доплате
    public bool isUved1Created { get; set; }


    // Дата
    // дата события доплаты
    public DateTime? d_sob1 { get; set; }
    // неделя
    public DateTime? d_sob2 { get; set; }
    // месяц
    public DateTime? d_sob3 { get; set; }
    // полгода
    public DateTime? d_sob4 { get; set; }
    // год
    public DateTime? d_sob5 { get; set; }
    // /дата

  }


  public class GetRegFreePlaceViewModel {
    public int ID { get; set; }
    public int M_SEANS_TIME_ID { get; set; }
    public int M_RYAD_ID { get; set; }
  }


  public class GetRegListViewModel {
   
    public int o_ank_id { get; set; }
    public int is_birthday { get; set; }
    public int vip { get; set; }
    public int ostalos_dn_abon { get; set; }
    public string fio { get; set; }
    public int seans_cnt { get; set; }
    public long rn { get; set; }
    public List<GetRegListDopUslViewModel> dopUslList { get; set; }
  }


  public class GetRegListDopUslViewModel {
    public int ID { get; set; }
    public string NAME { get; set; }
    public int KOLVO_POS { get; set; }
    // признак того, было ли сегодня изменение количества
    public int IZM { get; set; }
    public int O_SKLAD_RAS_PRODUCT_ID { get; set; }
    public int O_ANK_ID { get; set; }
  }





}

