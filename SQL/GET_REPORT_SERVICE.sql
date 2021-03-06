
--GO
--/****** Object:  StoredProcedure [dbo].[GET_REPORT_IST]    Script Date: 26.04.2017 23:27:53 ******/
--SET ANSI_NULLS ON
--GO
--SET QUOTED_IDENTIFIER ON
--GO
---- =============================================
---- Author:		Maynskiy Andrey
---- Create date: 26-04-2017
---- Description:	Отчет Сервис
---- =============================================
--CREATE PROCEDURE [dbo].[GET_REPORT_SERVICE]
--	@m_org_id int
--AS
--BEGIN

--   /*
	declare @M_ORG_ID int = 2
	--*/

	SELECT S.ID AS O_SERVICE_ID
			, S.O_ANK_ID
			, A.SURNAME as O_ANK_SURNAME
			, A.[NAME] as O_ANK_NAME
			, A.SECNAME as O_ANK_SECNAME
			, S.M_PRODUCT_ID
			, P.[NAME] as PRODUCT_NAME
			, S.CURRENT_M_SERVICE_TYPE_ID as M_SERVICE_TYPE_ID
			, ST.[NAME] AS M_SERVICE_TYPE_NAME
			, S.DATE_TEH_OTDEL
			, S.D_START
	FROM	(select	s.ID
					, s.O_ANK_ID
					, s.M_PRODUCT_ID
					, isnull(S.[M_SERVICE_TYPE_ID_TEH_OTDEL], [M_SERVICE_TYPE_ID]) as CURRENT_M_SERVICE_TYPE_ID
					, isnull([D_MODIF], [D_START]) as D_START
					, S.DATE_TEH_OTDEL
			from	O_SERVICE as S) S
			inner join M_SERVICE_TYPE as ST on ST.ID = S.CURRENT_M_SERVICE_TYPE_ID
			inner join O_ANK as A on A.ID = S.O_ANK_ID
			inner join M_PRODUCT as P on P.ID = S.M_PRODUCT_ID
			

	--SELECT * FROM O_SERVICE

--END

--declare @text varchar(4000) = ''
--	select s.ID,
--				 a.ID O_ANK_ID,
--				 s.D_START,
--				 s.DATE_TEH_OTDEL,
--				 isnull(a.SURNAME + ' ','') + isnull(a.NAME + ' ', '') + isnull(a.SECNAME,'') FIO,
--				 isnull(a.PHONE_MOBILE, a.PHONE_HOME) PHONE,
--				 p.NAME M_PRODUCT_ID_NAME,
--				 t.NAME M_SERVICE_TYPE_ID_NAME,
--				 o.NAME M_SERVICE_TYPE_ID_TEH_OTDEL_NAME,
--				 s.COMMENT,
--				 s.COMMENT_TEH_OTDEL,
--				 s.M_SERVICE_TYPE_ID,
--				 isnull(s.M_SERVICE_TYPE_ID_TEH_OTDEL,(select top 1 ID from dbo.M_SERVICE_TYPE)) M_SERVICE_TYPE_ID_TEH_OTDEL,
--				 s.SERIAL_NUMBER,
--				 s.M_ORG_ID
--		from dbo.O_ANK a
--		join dbo.O_SERVICE s on a.ID = s.O_ANK_ID
--		left join dbo.M_SERVICE_TYPE t on s.M_SERVICE_TYPE_ID = t.ID
--		left join dbo.M_SERVICE_TYPE o on s.M_SERVICE_TYPE_ID_TEH_OTDEL = o.ID
--		left join dbo.M_PRODUCT p on s.M_PRODUCT_ID = p.ID
--	 where ((s.M_ORG_ID = @m_org_id) and
--				  -- поиск по ФИО
--					((upper(isnull(a.SURNAME + '','') + isnull(a.NAME + ' ', '') + isnull(a.SECNAME,'')) like upper('%' + @text + '%') or
--						-- по телефону
--						replace(
--							replace(
--								replace(
--					 				replace(
--										isnull(a.PHONE_MOBILE, a.PHONE_HOME),
--									' ',''),
--								'-', ''),
--							')',''),	 
--						'(','') like '%' + @text + '%' or
--						-- по серийному номеру
--						upper(s.SERIAL_NUMBER) like upper('%' + @text + '%')) or
--					 (@text is null)));