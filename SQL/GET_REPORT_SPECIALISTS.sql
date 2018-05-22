-- =============================================
-- Author:		Maysnkiy Andrey
-- Create date: 22-01-2017
-- Description:	Данные для отчета специалисты
-- =============================================
if exists(select 1 from sys.procedures as a where a.name = 'GET_RETPORT_SPECIALISTS') drop procedure dbo.GET_RETPORT_SPECIALISTS;

GO

create procedure dbo.GET_RETPORT_SPECIALISTS
	@fromDate smalldatetime,
	@toDate smalldatetime,
	@m_org_id int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	/*
	declare @fromDate smalldatetime
	set @fromDate = cast('2016-01-01' as date)

	declare @toDate smalldatetime
	set @toDate = cast('2017-03-31' as date)

	declare @m_org_id int
	set @m_org_id = 1
	--*/

	--таблица для определения работы на контактах
	declare @workWihtKontact table(USERID int, KONTACKTS int, CAME int)
	insert @workWihtKontact
	select	w.USERID
			, count(w.ID) as KONTACTS
			, sum(case when w.SKR <> 0 then 1 else 0 end) as CAME
	from	(select	a.USERID,
					a.ID,
					a.SKR
			from	O_KONT_ANK as a
					inner join S_USER as u on u.ID = a.USERID
			where	u.M_ORG_ID = @m_org_id
					and 
					(a.D_START >= @fromDate and a.D_START <= @toDate 
					or a.D_START is null)) as w
	group by w.USERID

	--таблица для хранения количества звонков
	declare @workCall table(USERID int, COUNT_CALL int)
	insert	@workCall
	select	T.USERID, count(T.ID) as COUNT_CALL
	from	(select	ID, isnull(Z.D_START_USER_ID, isnull(Z.D_MODIF_USER_ID, Z.D_END_ISKL_USER_ID)) as USERID
			from	O_ZVONOK as Z
			where	z.D_START >= @fromDate and z.D_START <= @toDate ) as T
	WHERE	T.USERID is not null
	group by T.USERID;

  -- продажи
  declare @buy table(USERID int, COUNT_BUY int);
  insert into @buy(USERID, COUNT_BUY)
  select
    x.USERID,
    count(*) COUNT_BUY
  from
    dbo.O_SKLAD_RAS_PRODUCT x
  where
    x.M_ORG_ID = m_org_id and
    x.OPL_OST = 0 and
    x.COST > 0 and -- отсекаю подарки
    x.D_VID >= @fromDate and
    x.D_VID <= @toDate
  group by
    x.USERID
  ;

	select	u.ID as USERID
			--получаем поля через max чтобы сократить хвост group by положительно скажется при увелеичении объема данных
			, max(u.SURNAME) + ' ' + max(u.[NAME]) + ' ' + max(u.SECNAME) as FIO
			--данное поле временно не зополняется
			, cast(0 as int) as FRIENDS	--друзья
			, count(a.ID) as ANKETS		--АНКЕТЫ
			, count(d.O_ANK_ID) as DIALOG --общение
			, isnull(MAX(k.KONTACKTS),0) as KONTACTS	--записал
			, isnull(MAX(k.CAME),0) as CAME --пришло
			, isnull(MAX(k.KONTACKTS) - MAX(k.CAME),0) NOT_CAME --не пришло
			,case when MAX(k.CAME) = 0 or MAX(k.CAME) is null 
					then 0 
					else cast(
								(
									(MAX(cast(k.CAME as float)) / MAX(cast(k.KONTACKTS as float))) 
								* 100) 
							as int) end as [PERCENT] --%
			, isnull(max(buy.COUNT_BUY), 0) as BUY	--купил
			, isnull(MAX(c.COUNT_CALL),0) as COUNT_CALL --количество звонков
	from	S_USER as u
			--считаем анкеты в указанном промежутке по каждому человеку
			left join O_ANK as a on a.USER_REG = u.ID
									and a.DATE_REG >= @fromDate and a.DATE_REG <= @toDate
		
			left join O_DIALOG as d on d.USERID = u.ID
										and d.O_SEANS_ID is not null
										and d.DIALOG_DATE >= @fromDate and d.DIALOG_DATE <= @toDate
			left join @workWihtKontact as k on k.USERID = u.ID
			left join @workCall as c ON c.USERID = u.ID
      left join @buy as buy on buy.USERID = u.ID
	where
    u.M_ORG_ID = @m_org_id
	group by
    u.ID
  ;

END;
GO




