/****** Object:  StoredProcedure [dbo].[GET_COUNT_STAT_POS_BY_DAY]    Script Date: 12.01.2017 0:57:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Maynskiy Andrey
-- Create date: 22-12-2016
-- Description:	Возвращает количественне характериски посетеителей за день по организации
-- =============================================
ALTER PROCEDURE [dbo].[GET_COUNT_STAT_POS_BY_DAY]
	@m_org_id int,
	@seans_date smalldatetime
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

 /*
Данный запрос может быть оптимизирован, если данные по текущему дню помещать во временную таблицу

стоит поэксперементировать с расчетом "ушли и не записались" скорее всего можно переделать на outer apply и это 
может поднять производительность
*/

/*	declare @m_org_id int
	set	@m_org_id = 1
	--параметр запроса: дата формирования отчета
	declare @seans_date smalldatetime
	set @seans_date = '2016-12-20 00:00:00'
	--*/

	declare @useDate smalldatetime
	set @useDate = cast(@seans_date as date)
	--костанта показывающая что человек пришел на сеанс
	declare @cameState int
	set @cameState = 1

	-------------------------------------расчет-----------------------------------
	--количество записавшихся : считаем сколько всего было записей на сеансы 
	declare @countSignetUP int
	select	@countSignetUP = count(*)
	from	dbo.O_SEANS as s
	where	s.M_ORG_ID = @m_org_id
			and cast(s.SEANS_DATE as date) = @useDate

	--количество пришедших : количетсо со статусои пришли
	declare @countCame int
	select	@countCame = count(*)
	from	dbo.O_SEANS as s
	where	s.M_ORG_ID = @m_org_id
			and cast(s.D_REG as date) = @seans_date

	--количество не пришло
	declare @notCountCame int
	select	@notCountCame = count(*)
	from	dbo.O_SEANS as o
	where	o.M_ORG_ID = @m_org_id
			and cast(o.SEANS_DATE as date) = @useDate
			and o.D_REG is null
	
	--количество новеньких: те у кого дата сеанса совпадает с датой регистрации
	declare @countNew int
	select	@countNew = count(*)
	from	dbo.O_SEANS as s
			inner join dbo.O_ANK as a on a.ID = s.O_ANK_ID
	where	s.M_ORG_ID = @m_org_id
			--and s.SEANS_DATE = @seans_date
			and cast(a.DATE_REG as date) = @useDate
			and cast(s.D_REG as date) = @useDate

	--ушли и не записались: находим всех, кто после текущего дня небыл ни разу
	declare @notRecord int
	----(в подзапросе cs - Current Seans, ns - Next Seans)
	--select	@notRecord = count(O_ANK_ID)	--финальный подсчет уникальных анкет
	--from	(select	cs.O_ANK_ID
	--		from	O_SEANS as cs	--данная таблица используется как источник данных по текущему сеансу
	--				--данное переседение для каждой строки даст список всех сеансов после текущего ориентируясь на анкету
	--				left join O_SEANS as ns on ns.SEANS_DATE > cs.SEANS_DATE
	--										and ns.O_ANK_ID = cs.O_ANK_ID
	--		where	cs.M_ORG_ID = @m_org_id
	--				and cs.SEANS_DATE = @seans_date
	--		group by cs.O_ANK_ID	--группируем по анкете
	--		having count(ns.ID) = 0	--оставляем только те строки для которых не было найдено больше сеансов
	--				) as t 
	select	@notRecord = count(*)
	from	dbo.O_SEANS as o
	where	o.M_ORG_ID = @m_org_id
			and cast(o.D_REG as date) = @useDate
			and not exists( select	*
							from	dbo.O_SEANS oInner
							where	o.O_ANK_ID = oInner.O_ANK_ID
											-- на кого сегодня
									and cast(oInner.D_START as date) = @useDate
											-- не завели запись на сеанс на "завтра"
									and cast(oInner.SEANS_DATE as date) > @useDate)


	--без регистрации: количество элементов у которых проставлен статус "Без регистрации"
	declare @notReg int
	select	@notReg = count(*)
	from	dbo.O_SEANS as s 
	where	s.M_ORG_ID = @m_org_id
			and cast(s.D_START as date) = @seans_date
			and s.BEZ_REG = 1

	---------------------------------вывод результатов-----------------------------
	select	@countSignetUP as Record	--записалось
			, @countCame as Came	--пришло
			, @notCountCame as NotCame --не пришло
			, @countNew as New --новенькие
			, @notRecord as NotRecord --ушли и не записались
			, @notReg as NotReg -- без регистарции
END
