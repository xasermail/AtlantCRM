
if exists(select 1 from sys.procedures as a where a.name = 'GET_TEH_OTDEL_DATA') drop procedure dbo.GET_TEH_OTDEL_DATA;

GO

create procedure [dbo].[GET_TEH_OTDEL_DATA]
	@m_org_id int = null,
	@text varchar(4000) as
begin
	select s.ID,
				 a.ID O_ANK_ID,
				 s.D_START,
				 s.DATE_TEH_OTDEL,
				 isnull(a.SURNAME + ' ','') + isnull(a.NAME + ' ', '') + isnull(a.SECNAME,'') FIO,
				 isnull(a.PHONE_MOBILE, a.PHONE_HOME) PHONE,
				 p.NAME M_PRODUCT_ID_NAME,
				 t.NAME M_SERVICE_TYPE_ID_NAME,
				 o.NAME M_SERVICE_TYPE_ID_TEH_OTDEL_NAME,
				 s.COMMENT,
				 s.COMMENT_TEH_OTDEL,
				 s.M_SERVICE_TYPE_ID,
				 isnull(s.M_SERVICE_TYPE_ID_TEH_OTDEL,(select top 1 ID from dbo.M_SERVICE_TYPE)) M_SERVICE_TYPE_ID_TEH_OTDEL,
				 'SN ' + s.SERIAL_NUMBER,
				 s.M_ORG_ID
		from dbo.O_ANK a
		join dbo.O_SERVICE s on a.ID = s.O_ANK_ID
		left join dbo.M_SERVICE_TYPE t on s.M_SERVICE_TYPE_ID = t.ID
		left join dbo.M_SERVICE_TYPE o on s.M_SERVICE_TYPE_ID_TEH_OTDEL = o.ID
		left join dbo.M_PRODUCT p on s.M_PRODUCT_ID = p.ID
	 where ((s.M_ORG_ID = @m_org_id) and
				  -- поиск по ФИО
					((upper(isnull(a.SURNAME + '','') + isnull(a.NAME + ' ', '') + isnull(a.SECNAME,'')) like upper('%' + @text + '%') or
						-- по телефону
						replace(
							replace(
								replace(
					 				replace(
										isnull(a.PHONE_MOBILE, a.PHONE_HOME),
									' ',''),
								'-', ''),
							')',''),	 
						'(','') like '%' + @text + '%' or
						-- по серийному номеру
						upper(s.SERIAL_NUMBER) like upper('%' + @text + '%')) or
					 (@text is null)));
end;