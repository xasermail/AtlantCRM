-- =============================================
-- Author:		Maynskiy Andrey
-- Create date: 25-15-2016
-- Description:	Возвращет список записавшихся с телефонами
-- =============================================
if exists(select 1 from sys.procedures as a where a.name = 'GET_LIST_RECORD') drop procedure dbo.GET_LIST_RECORD;

GO

create procedure dbo.GET_LIST_RECORD
	@m_org_id int,
	@d date
AS
BEGIN
/*
-- какая организация
declare @m_org_id int = 2;
-- на какую дату
declare @d date = cast('2017-01-25' as date);
--*/

	SET NOCOUNT ON;

	select	distinct a.SURNAME + ' ' + a.[NAME] + ' ' + a.SECNAME as FIO,
			isnull(a.PHONE_MOBILE, a.PHONE_HOME) as Phone
	from	dbo.O_SEANS as s
			inner join dbo.O_ANK as a on a.ID = s.O_ANK_ID
	where	s.M_ORG_ID = @m_org_id
			and cast(s.SEANS_DATE as date) = @d
END
GO
