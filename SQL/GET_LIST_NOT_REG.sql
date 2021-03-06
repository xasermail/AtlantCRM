/****** Object:  StoredProcedure [dbo].[GET_LIST_NOT_REG]    Script Date: 16.01.2017 0:36:41 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Maynskiy Andrey
-- Create date: 25-15-2016
-- Description:	Возвращет список не зарегестрировавшихся
-- =============================================
ALTER PROCEDURE [dbo].[GET_LIST_NOT_REG]
	@m_org_id int,
	@d date
AS
BEGIN
/*
-- какая организация
--declare @m_org_id int = 1;
declare @m_org_id int = 1;
-- на какую дату
declare @d date = cast('2017-01-03' as date);
--*/

	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	select	a.id, a.SURNAME + ' ' + a.[NAME] + ' ' + a.SECNAME as FIO,
			isnull(a.PHONE_MOBILE, a.PHONE_HOME) as Phone,
			t.MIN_TIME as Reg,
			--'' as FirstRyad,
			--'' as SecondRyad,
			isnull((select max(isnull(u.surname,'') + ' ' + isnull(u.name + ' ','') + isnull(u.secname,''))
									 from s_user u
								   join o_dialog d on u.id = d.userid
								  where cast(dialog_date as date) = cast(@d as date)
										and d.o_ank_id = s.o_ank_id
										and s.m_ryad_id = 1),'') FirstRyad,
				 isnull((select max(isnull(u.surname,'') + ' ' + isnull(u.name + ' ','') + isnull(u.secname,''))
									 from s_user u
								   join o_dialog d on u.id = d.userid
								  where cast(dialog_date as date) = cast(@d as date)
										and d.o_ank_id = s.o_ank_id
										and s.m_ryad_id = 2),'') SecondRyad

	from	dbo.O_SEANS as s
			inner join dbo.O_ANK as a on a.ID = s.O_ANK_ID
			 join dbo.M_SEANS_TIME t on t.ID = s.M_SEANS_TIME_ID
	where	s.M_ORG_ID = @m_org_id
			  and cast(coalesce(s.D_REG, s.SEANS_DATE, s.D_START) as date) = @d
			and s.BEZ_REG = 1
END
