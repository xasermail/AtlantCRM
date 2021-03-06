/****** Object:  StoredProcedure [dbo].[GET_LIST_NEW]    Script Date: 12.01.2017 0:09:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Maynskiy Andrey
-- Create date: 25-15-2016
-- Description:	Возвращет список новеньких с телефонами
-- =============================================
ALTER PROCEDURE [dbo].[GET_LIST_NEW]
	@m_org_id int,
	@d date
AS
BEGIN
/*
-- какая организация
declare @m_org_id int = 2;
-- на какую дату
declare @d date = cast('2017-01-11 00:00:00' as date);
--*/

	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	select	 a.SURNAME + ' ' + a.[NAME] + ' ' + a.SECNAME as FIO,
			isnull(a.PHONE_MOBILE, a.PHONE_HOME) as Phone
	from	dbo.O_SEANS as s
			inner join dbo.O_ANK as a on a.ID = s.O_ANK_ID
	where	s.M_ORG_ID = @m_org_id
			and cast(a.DATE_REG as date) = @d
			and cast(s.D_REG as date) = @d
END
