-- =============================================
-- Author:		Maynskiy Andrey
-- Create date: 25-15-2016
-- Description:	Возвращет список ушедших и не записавшихся
-- =============================================
if exists(select 1 from sys.procedures as a where a.name = 'GET_LIST_NOT_RECORD') drop procedure dbo.GET_LIST_NOT_RECORD;

GO

create procedure [dbo].[GET_LIST_NOT_RECORD]
	@m_org_id int,
	@d date
AS
BEGIN
/*
-- какая организация
declare @m_org_id int = 1;
-- на какую дату
declare @d date = cast('2017-01-15' as date);
--*/

	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	
	--идентификатор 1-го ряда
	declare @firstRyadID int
	set @firstRyadID = 1

	--идентификатор 2-го ряда
	declare @secondRyadID int
	set @secondRyadID = 2


	--получаем список общавшихся на рядах
	declare @whoSpokeInRyad table(O_ANK_ID int, WhoSpoke varchar(max))
	insert @whoSpokeInRyad
	select
	  o.O_ANK_ID,
	  -- комментариев может быть много, поэтому делаю подзапросом
	  (select top 1
		   isnull(s.SURNAME + ' ', '') + isnull(s.NAME + ' ', '') + isnull(s.SECNAME, '')
		 from
		   dbo.O_DIALOG d
			 join dbo.S_USER s on s.ID = d.USERID
		 where
			d.O_SEANS_ID = o.ID
		 order by
		   d.ID desc
		 ) WhoSpoke
	from
	  dbo.O_SEANS o
	where
	  o.M_ORG_ID = @m_org_id
	  and cast(o.D_REG as date) = @d

	----результирующий запрос
	select	a.ID,
	a.SURNAME + ' ' + a.[NAME] + ' ' + a.SECNAME as FIO,
			isnull(a.PHONE_MOBILE, a.PHONE_HOME) as Phone,
			cast(
				format( cast( DATEADD(hour,
						datediff(hour, dbo.CREATE_DATE(@m_org_id), getdate()), s.D_REG ) as time), N'hh\:mm') as varchar(max)
				) as TimeReg,
			cast(t.MAX_TIME as varchar(max)) as TimeInRyad,
			
			case 
				when s.M_RYAD_ID = @firstRyadID 
					 and ws.O_ANK_ID is not null 
				then isnull(ws.WhoSpoke, '') 
				else '' 
				end  as WhoSpokeInFirstRyad,
			case 
				when s.M_RYAD_ID = @secondRyadID 
					 and ws.O_ANK_ID is not null 
				then isnull(ws.WhoSpoke, '') 
				else '' 
				end  as WhoSpokeInSecondRyad
	from	dbo.O_SEANS as s
			inner join dbo.O_ANK as a on a.ID = s.O_ANK_ID
			join dbo.M_SEANS_TIME t on t.ID = s.M_SEANS_TIME_ID
			left join @whoSpokeInRyad as ws on ws.O_ANK_ID = s.O_ANK_ID
	where	s.M_ORG_ID = @m_org_id
			and cast(s.D_REG as date) = @d
			and not exists( select	*
							from	dbo.O_SEANS oInner
							where	s.O_ANK_ID = oInner.O_ANK_ID
									-- на кого сегодня
									and cast(oInner.D_START as date) = @d
									-- не завели запись на сеанс на "завтра"
									and cast(oInner.SEANS_DATE as date) > @d
							)
END



