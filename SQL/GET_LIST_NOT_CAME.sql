-- =============================================
-- Author:		Maynskiy Andrey
-- Create date: 25-15-2016
-- Description:	Возвращет список не пришедших с телефонами
-- =============================================
if exists(select 1 from sys.procedures as a where a.name = 'GET_LIST_NOT_CAME') drop procedure dbo.GET_LIST_NOT_CAME;

GO

create procedure dbo.GET_LIST_NOT_CAME
	@m_org_id int,
	@d date
AS
BEGIN
/*
-- какая организация
declare @m_org_id int = 1;
-- на какую дату
declare @d date = cast('23.12.2016' as date);
--*/

	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	select	a.SURNAME + ' ' + a.[NAME] + ' ' + a.SECNAME as FIO,
			isnull(a.PHONE_MOBILE, a.PHONE_HOME) as Phone
	from	dbo.O_SEANS as s
			inner join dbo.O_ANK as a on a.ID = s.O_ANK_ID
	where	s.M_ORG_ID = @m_org_id
			and cast(s.SEANS_DATE as date) = @d
			and s.D_REG is null
END
GO
