/* получить Отчёт - Деь */

if exists(select 1 from sys.procedures as a where a.name = 'GET_DAY_REPORT') drop procedure dbo.GET_DAY_REPORT;

GO

-- =============================================
-- Author:		Maynskiy Andrey
-- Create date: 17-12-2016
-- Description:	Формирует данные для отчета по дням
-- =============================================
create procedure [dbo].[GET_DAY_REPORT] 
	@m_org_id int, 
	@seans_date smalldatetime
AS
BEGIN
/*
--параметр текущей организации
declare @m_org_id int
set	@m_org_id = 2
--параметр запроса: дата формирования отчета
declare @seans_date smalldatetime
set @seans_date = '2017-01-24 00:00:00'
--*/
	SET NOCOUNT ON;
	--используемая дата формирования отчета (исключаем необхоимость по коду писать одно и тоже приведение)
	declare @useSeans_date smalldatetime
	set @useSeans_date = cast(@seans_date as date)

	--меняем настройку так чтобы понедельник стал первым нем недели (разрабатывая на тестовом сервере настройка = 7)
	set datefirst 1	

	--следущий день
	declare @nextDay smalldatetime = dateadd(DAY, 1, @useSeans_date)
	--пока следующийдень не рабочий
	while((select count(*) from	M_WORK_DAY as D where d.DAY_ID = datepart(dw,@nextDay)) = 0)
	begin	--двигаем еще на один день
	 set @nextDay = dateadd(DAY, 1, @nextDay)
	end

	--предыдущий день
	declare @prevDay smalldatetime = dateadd(DAY, -1, @useSeans_date)

	--пока предыдущий день не рабочий
	while((select count(*) from	M_WORK_DAY as D where d.DAY_ID = datepart(dw,@prevDay)) = 0)
	begin	--двиаем на один день назад
	 set @prevDay = dateadd(DAY, -1, @prevDay)
	end
	
	--востанавливаем значение по умолчанию для настройки дней
	set datefirst 7	

	--используемый статус для расчета
	declare @useState int
	set @useState = 1
	--количество посещений чтобы считать "родненьким"
	declare @countPorForOld int
	set	@countPorForOld = 20

	declare @firstRyadId int 
	select @firstRyadId = id
	from M_RYAD
	where [NAME] = '1-й ряд'

	--объявляем таблицу для хранения промежуточных результатов за текущий день
	declare @allAnkForCurrentDay table (M_SEANS_TIME_ID int,  M_RYAD_ID int, O_ANK_ID int, IS_NEW bit, IS_OLD BIT)

	--объявляем таблицу для хранения промежуточных результатов за следущий день
	declare @allAnkForNextDay table (M_SEANS_TIME_ID int,  M_RYAD_ID int, ALL_ANK int)

	--объявляем таблицу для хранения промежуточных результатов за следущий день
	declare @allRecordAnkForNextDay table (M_SEANS_TIME_ID int, ALL_ANK int)

	--объявляем таблицу для хранения промежуточных результатов за предыдущий день
	declare @allAnkForPrevDay table (M_SEANS_TIME_ID int,  M_RYAD_ID int, ALL_ANK int)

	--заполняем таблицу на текущий день
	insert	@allAnkForCurrentDay(M_SEANS_TIME_ID ,  M_RYAD_ID , O_ANK_ID )
	select	s.M_SEANS_TIME_ID		--время сеанса
			,s.M_RYAD_ID			--идентификатор ряда
			, s.O_ANK_ID			--идентификатор записавшегося человека
	from	[dbo].[M_RYAD] as r
			inner join [dbo].[O_SEANS] as s on s.M_RYAD_ID = r.ID
	where	s.M_ORG_ID = @m_org_id
			and cast(s.D_REG as date) = @useSeans_date



	--заполняем таблицу за следущий день
	insert @allAnkForNextDay
	select	s.M_SEANS_TIME_ID
			,s.M_RYAD_ID
			, count(s.O_ANK_ID) as ALL_ANK
	from	[dbo].[M_RYAD] as r
			inner join [dbo].[O_SEANS] as s on s.M_RYAD_ID = r.ID
	where	s.M_ORG_ID = @m_org_id
			and cast(s.D_REG as date) = @nextDay
	group by s.M_SEANS_TIME_ID	
			,s.M_RYAD_ID

	--заполняем таблицу записавшихся за следущий день
	insert @allRecordAnkForNextDay
	select	s.M_SEANS_TIME_ID
			, count(s.O_ANK_ID) as ALL_ANK
	--from	[dbo].[M_RYAD] as r
	--		inner join [dbo].[O_SEANS] as s on s.M_RYAD_ID = r.ID
	--where	s.M_ORG_ID = @m_org_id
	--		and cast(s.SEANS_DATE as date) = dateadd(day,1,@useSeans_date)
	--group by s.M_SEANS_TIME_ID	
	--		,s.M_RYAD_ID
	from	[dbo].[O_SEANS] as s 
	where	s.M_ORG_ID = @m_org_id
			and cast(s.SEANS_DATE as date) = @nextDay
	group by s.M_SEANS_TIME_ID	
			
	--заполняем таблицу за следущий день
	insert @allAnkForPrevDay
	select	s.M_SEANS_TIME_ID
			,s.M_RYAD_ID
			, count(s.O_ANK_ID) as ALL_ANK
	from	[dbo].[M_RYAD] as r
			inner join [dbo].[O_SEANS] as s on s.M_RYAD_ID = r.ID
	where	s.M_ORG_ID = @m_org_id
			and cast(s.D_REG as date) = @prevDay
	group by s.M_SEANS_TIME_ID	
			,s.M_RYAD_ID

	--выставляем всем за текущий день признак нового посетителя
	update	cd 
	set		cd.IS_NEW = case when cast(a.[DATE_REG] as date) = @useSeans_date then 1 
				else 0 end
	from	@allAnkForCurrentDay as cd 
			inner join [dbo].[O_ANK] as a on a.ID = cd.O_ANK_ID

	--для всех в текущий день не новых проверяем можно ли их отнести к родненьким
	update	cd
	set		cd.IS_OLD = case when t.COUNT_POS >= @countPorForOld then 1 else 0 end
	from	@allAnkForCurrentDay as cd
			inner join (select cd.O_ANK_ID, count(s.ID) as COUNT_POS
						from	@allAnkForCurrentDay as cd
								inner join [dbo].[O_SEANS] as s on s.O_ANK_ID = cd.O_ANK_ID
						where   cd.IS_NEW = 0 
						group by cd.O_ANK_ID) as t on t.O_ANK_ID = cd.O_ANK_ID

	--результирующая таблица (основные элемнеты)
	declare @resultTable table (M_SEANS_TIME_ID int,
								M_SEANS_TIME_NAME varchar(100),
								M_RYAD_ID int,
								M_RYAD_NAME varchar(500))
	--наполняем таблицу данными
	insert	@resultTable
	select	st.ID as SEANS_TIME_ID,
			st.[NAME] as SEANS_TIME_NAME,
			r.ID as RYAD_ID,
			r.[NAME] as RYAD_NAME
	from	dbo.M_SEANS_TIME as st
			, [dbo].[M_RYAD] as r
	where	st.M_ORG_ID = @m_org_id


	select	c.SEANS_TIME_ID
		, c.SEANS_TIME_NAME
		, c.RYAD_ID
		, c.RYAD_NAME
		, c.ALL_ANK
		, c.All_NEW
		, c.All_OLD
		, isnull(r.ALL_ANK,0) - isnull(c.ALL_ANK,0) as DIFERENT_FOR_TOMMORROW
		, isnull(r.ALL_ANK,0) as RECORD_FOR_TOMMORROW
		, isnull(p.ALL_ANK,0) - isnull(c.ALL_ANK,0) as DIFERENT_FOR_YESTERDAY
	from (	select	h.SEANS_TIME_ID
					, h.SEANS_TIME_NAME
					, h.RYAD_ID
					, h.RYAD_NAME
					, isnull(r.ALL_ANK, 0) as ALL_ANK
					, isnull(r.All_NEW, 0) as All_NEW
					, isnull(r.All_OLD, 0) as All_OLD
					, h.MIN_TIME_MINUTES
			from	(--все комбинации времент и рядов
					select	st.ID as SEANS_TIME_ID,
							st.[NAME] as SEANS_TIME_NAME,
							r.ID as RYAD_ID,
							r.[NAME] as RYAD_NAME,
							st.MIN_TIME_MINUTES
					from	dbo.M_SEANS_TIME as st
							, [dbo].[M_RYAD] as r
					where	st.M_ORG_ID = @m_org_id
					) as h
					left join (--досчитываем все извествные данные
								select	c.M_SEANS_TIME_ID,
										c.M_RYAD_ID,
										c.ALL_ANK,
										c.All_NEW,
										c.All_OLD
								from	(--результирующие значения по текущему дню
										select	c.M_SEANS_TIME_ID
												, c.M_RYAD_ID, 
												count(c.O_ANK_ID) as ALL_ANK, 
												sum(case when c.IS_NEW = 1 then 1 else 0 end) as All_NEW,
												sum(case when c.IS_OLD = 1 then 1 else 0 end) as All_OLD
										from	@allAnkForCurrentDay as c
										group by c.M_SEANS_TIME_ID, c.M_RYAD_ID) as c) as r 
															on r.M_RYAD_ID = h.RYAD_ID
																and r.M_SEANS_TIME_ID = h.SEANS_TIME_ID
			) as c
			left join @allAnkForNextDay as n on n.M_SEANS_TIME_ID = c.SEANS_TIME_ID
																			and n.M_RYAD_ID = c.RYAD_ID
			left join @allAnkForPrevDay as p on p.M_SEANS_TIME_ID = c.SEANS_TIME_ID
																			and p.M_RYAD_ID = c.RYAD_ID
			left join @allRecordAnkForNextDay as r on r.M_SEANS_TIME_ID = c.SEANS_TIME_ID
																and c.RYAD_ID = @firstRyadId
		order by c.MIN_TIME_MINUTES

END; -- proc


GO

set dateformat dmy;

go

declare @d smalldatetime = cast('10.03.2017' as date);
exec [dbo].[GET_DAY_REPORT] @m_org_id = 2, @seans_date = @d;

GO