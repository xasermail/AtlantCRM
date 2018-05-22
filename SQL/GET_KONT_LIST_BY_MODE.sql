-- =============================================
-- Author:		Maynskiy Andrey
-- Create date: 04.01.2017
-- Description:	Возвращает список контактов в указанном режиме
-- 1 - не пришедншие
-- 2 - скрытые (все типы)
-- 3 - рекомендованные (только не скрытые)
-- =============================================
if exists(select 1 from sys.procedures as a where a.name = 'GET_KONT_LIST_BY_MODE') drop procedure dbo.GET_KONT_LIST_BY_MODE;

GO

create procedure [dbo].[GET_KONT_LIST_BY_MODE]
@m_org_id int,
@page int,
@rows_per_page int,
@mode int,

-- ID контакта, который надо отобразить первым в списке, используется для поиска по Не пришедшим
@o_kont_ank_id_search int = -1,

-- передаётся при поиске анкеты по Рекомендованным, приходит O_REK_ANK.ID человека,
-- которого надо отобразить в результатах поиска, он должен быть в самом верху
@o_rek_ank_id_search int = -1,

-- фильтр по Не пришедшим, Статус контакта
@nePrFilterM_KONT_STATUS_ID int = null,
-- фильтр по Не пришедшим, Источник контакта
@nePrFilterM_KONT_IST_ID int = null,

-- направление сортировки по полю Дата звонка, для Не пришедших
-- 0 - без сортировки, 1 - возрастание, 2 - убывание
@nePrOrderByD_ZV int = 0

AS	 
BEGIN
/*
	declare @m_org_id int
	set @m_org_id = 1
	declare @page int 
	set @page = 1
	declare @rows_per_page int
	set @rows_per_page = 6
	declare @mode int
	set @mode = 3
--*/
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	declare @hidedKontact int
	set @hidedKontact = 2

	declare @MODE_NOT_CAME int = 1 -- НЕ ПРИШЕДШИЕ 
	declare @MODE_HIDE int = 2  -- СКРЫТЫЕ
	declare @MODE_REC int = 3  -- РЕКОМЕНДОВАННЫЕ

  -- статус контакта "<выберите статус>"
  declare @M_KONT_STATUS_ID_VIBERITE_STATUS int = 1;
  -- статус контакта "Срочно"
  declare @M_KONT_STATUS_ID_SROCHNO int = 2;

  -- источник контакта "<выберите статус>"
  declare @M_KONT_IST_ID_VIBERITE_STATUS int = 1;

	declare @curDate smalldatetime
	set @curDate = cast(GETDATE() as date)

	declare @cnt int;

  -- контакты Рекомендованные
	if @mode = @MODE_REC
	begin

    -- сначала считаю количество записей
		select
      @cnt = count(*)
		from	O_REK_ANK as s
		where	s.M_ORG_ID = @m_org_id
				and s.SKR = 0
				and s.O_ANK_ID is null
    ;

	  select
       -1 as KONT_SEANS_ID
			,s.ID as KONT_ID
			,s.SURNAME
			,s.[NAME]
			,s.SECNAME
			,s.PHONE
			,'' as SEANS
			,null as D_ZV 
			,'' as COMMENT
			,-1 as M_SEANS_TIME_ID
			,s.SKR
			,@cnt as COUNT_ALL
      -- у рекомендованных нет статуса контакта
      ,@M_KONT_STATUS_ID_VIBERITE_STATUS M_KONT_STATUS_ID
      ,'<не задан>' M_KONT_STATUS_ID_NAME
      -- у рекомендованных нет источника контакта
      ,@M_KONT_IST_ID_VIBERITE_STATUS M_KONT_IST_ID
      ,'<не задан>' M_KONT_IST_ID_NAME
	  from
      O_REK_ANK as s
	  where
      s.M_ORG_ID = @m_org_id
		  and s.SKR = 0
		  and s.O_ANK_ID is null
	  order by
      -- самым первым должен оказаться человек, по которому
      -- идёт поиск (опционально)
      case when s.ID = @o_rek_ank_id_search then - 1 else s.ID end
	  offset
	    (@page - 1) * @rows_per_page rows
	  fetch next
	    @rows_per_page rows only
    ;

  -- контакты Не пришедшие и Скрытые
	end else begin

    -- сначала считаю количество записей
		select @cnt = count(*)
		from
      dbo.O_KONT_SEANS as s
			join dbo.O_KONT_ANK as a on a.ID = s.O_KONT_ANK_ID
			left join dbo.M_SEANS_TIME as st on st.ID = s.M_SEANS_TIME_ID
		where
/* !!!  при добавлении условий сюда, такие же условия надо добавить в запрос НИЖЕ */
        s.M_ORG_ID = @m_org_id
				and 
				(
					(@mode = @MODE_HIDE and a.SKR > 0)
					or
					(@mode = @MODE_NOT_CAME and a.SKR = 0 and (s.SEANS_DATE < @curDate or a.SOZD_NEPR = 1))
				)
        -- фильтр по режиму Не пришедшие
        and (
          (
            @mode = @MODE_NOT_CAME
            and (@nePrFilterM_KONT_STATUS_ID is null or a.M_KONT_STATUS_ID = @nePrFilterM_KONT_STATUS_ID)
            and (@nePrFilterM_KONT_IST_ID is null or a.M_KONT_IST_ID = @nePrFilterM_KONT_IST_ID)
          )
          or
          @mode <> @MODE_NOT_CAME
        )
    ;

		select
       s.ID as KONT_SEANS_ID
			,a.ID as KONT_ID
			,a.SURNAME
			,a.[NAME]
			,a.SECNAME
			,a.PHONE
			,format(s.SEANS_DATE, 'dd.MM.yyyy')+' ' +st.[NAME] as SEANS
			,s.D_ZV 
      -- комментариев может быть много, для отображения использую последний,
      -- все комментарии получаются в другом запросе, при наполнении интерфейса
			,(select top 1 sc.COMMENT from dbo.O_KONT_SEANS_COMMENT sc where sc.O_KONT_SEANS_ID = s.ID order by sc.ID desc) COMMENT
			,s.M_SEANS_TIME_ID
			,a.SKR
			,@cnt as COUNT_ALL
      ,a.M_KONT_STATUS_ID
      ,case when a.M_KONT_STATUS_ID = @M_KONT_STATUS_ID_VIBERITE_STATUS then '' else kst.[NAME] end M_KONT_STATUS_ID_NAME
      ,a.M_KONT_IST_ID
      ,case when a.M_KONT_IST_ID = @M_KONT_IST_ID_VIBERITE_STATUS then '' else kist.[NAME] end M_KONT_IST_ID_NAME
		from
      dbo.O_KONT_SEANS as s
		  join dbo.O_KONT_ANK as a on a.ID = s.O_KONT_ANK_ID
			left join dbo.M_SEANS_TIME as st on st.ID = s.M_SEANS_TIME_ID
      left join dbo.M_KONT_STATUS kst on kst.ID = a.M_KONT_STATUS_ID
      left join dbo.M_KONT_IST kist on kist.ID = a.M_KONT_IST_ID
		where
/* !!!  при добавлении условий сюда, такие же условия надо добавить в запрос ВЫШЕ */
        s.M_ORG_ID = @m_org_id
				and 
				(
					(@mode = @MODE_HIDE and a.SKR > 0)
					or
					(@mode = @MODE_NOT_CAME and a.SKR = 0 and (s.SEANS_DATE < @curDate or a.SOZD_NEPR = 1))
				)
        -- фильтр по режиму Не пришедшие
        and (
          (
            @mode = @MODE_NOT_CAME
            and (@nePrFilterM_KONT_STATUS_ID is null or a.M_KONT_STATUS_ID = @nePrFilterM_KONT_STATUS_ID)
            and (@nePrFilterM_KONT_IST_ID is null or a.M_KONT_IST_ID = @nePrFilterM_KONT_IST_ID)
          )
          or
          @mode <> @MODE_NOT_CAME
        )
		order by

      case when @mode = @MODE_NOT_CAME and a.ID = @o_kont_ank_id_search then 1 else 2 end

      -- для режима Не пришедшие задаётся направление сортировки по полю Дата звонка,
      -- 0 - без сортировки, 1 - по возрастанию, 2 - по убыванию
      ,case when @mode = @MODE_NOT_CAME and @nePrOrderByD_ZV = 0 then 0 else 0 end
      ,case when @mode = @MODE_NOT_CAME and @nePrOrderByD_ZV = 1 then s.D_ZV else 0 end asc
      ,case when @mode = @MODE_NOT_CAME and @nePrOrderByD_ZV =2 then s.D_ZV else 0 end desc

      -- для режима Не пришедшие те Контакты у которых статус "Срочно" должны появляться сверху, остальные ниже
      ,case
        when @mode = @MODE_NOT_CAME then
          case when a.M_KONT_STATUS_ID = @M_KONT_STATUS_ID_SROCHNO
            then 1
            else 2
          end
        -- для других режимов не учитывать
        else 0 
      end,

      -- для режима Не пришедшие, не пришедшие созданные из интерфейса должны отображаться выше остальных
      case when @mode = @MODE_NOT_CAME and a.SOZD_NEPR = 1 then 1 else 2 end,
      -- и последние созданные в самом верху
      case when @mode = @MODE_NOT_CAME and a.SOZD_NEPR = 1 then a.D_START else 0 end desc,

      s.ID

		offset
		  (@page - 1) * @rows_per_page rows
		fetch next
		  @rows_per_page rows only

	end; -- else 

END; -- proc

go

set dateformat dmy;
exec [dbo].[GET_KONT_LIST_BY_MODE]
  @m_org_id = 2,
  @page = 1,
  @rows_per_page = 20,
  @mode = 1,
  @o_kont_ank_id_search = 4733,
  @nePrFilterM_KONT_STATUS_ID = null,
  @nePrFilterM_KONT_IST_ID = null,
  @nePrOrderByD_ZV = 0
;