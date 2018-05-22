
if exists(select 1 from sys.procedures as a where a.name = 'GET_RECORD_DATA') drop procedure dbo.GET_RECORD_DATA;

GO

create procedure [dbo].[GET_RECORD_DATA]
	@date smalldatetime = null,
	@m_org_id int = null as
begin
	select s.o_ank_id,
				 s.m_seans_time_id,
				 s.seans_state,
				 isnull(a.surname,'') + ' ' + isnull(substring(a.name,1,1)+ '. ','') + isnull(substring(a.secname,1,1)+ '.','') fio,
				 case when month(a.BIRTHDAY) = month(@date) and day(a.BIRTHDAY) = day(@date) then 1 else 0 end birth,
				 convert(varchar(10),a.date_reg,120) date_reg,
				 isnull((select max(1) from o_dialog d where d.o_ank_id = a.id and cast(dialog_date as date) = cast(@date as date)),0) dialog,
				 (select count(*) from o_seans o where o.o_ank_id = a.id and cast(o.d_reg as date) <= cast(@date as date) and o.seans_state = 1 and m_org_id = @m_org_id) visits,
				 cast(row_number() over(partition by t.id order by s.seans_state desc) as int) nRow,
				 t.id nCol,
				 (select count(*) from o_seans o where o.o_ank_id = a.id and cast(o.seans_date as date) > cast(@date as date) and m_org_id = @m_org_id) new_seans,
				 isnull(a.phone_mobile,a.phone_home) phone,
				 isnull(a.surname + ' ','') + isnull(a.name + ' ','') + isnull(a.secname,'') fio_full,
				 substring(cast(CAST(s.d_reg AS TIME) as varchar(50)),1,5) reg_time,
				 isnull((select max(isnull(u.surname,'') + ' ' + isnull(u.name + ' ','') + isnull(u.secname,''))
									 from s_user u
								   join o_dialog d on u.id = d.userid
								  where cast(dialog_date as date) = cast(@date as date)
										and d.o_ank_id = s.o_ank_id
										and s.m_ryad_id = 1),'') user_ryad_1,
				 isnull((select max(isnull(u.surname,'') + ' ' + isnull(u.name + ' ','') + isnull(u.secname,''))
									 from s_user u
								   join o_dialog d on u.id = d.userid
								  where cast(dialog_date as date) = cast(@date as date)
										and d.o_ank_id = s.o_ank_id
										and s.m_ryad_id = 2),'') user_ryad_2,
				 s.bez_reg,
				 (select substring(cast(cast(min(dialog_date) as time) as varchar(50)),1,5)
						from o_dialog 
				   where o_ank_id = s.o_ank_id 
						 and cast(dialog_date as date) = cast(@date as date)) lane_time,
				 (select max(isnull(surname,'') + ' ' + isnull(name + ' ','') + isnull(secname,'')) from s_user where id = s.userid and s.bez_reg = 1) bez_reg_user,
				 (select replace(replace(replace(substring(buzz, 2, 20000),'</name><name>',', '),'</name>',''),'name>','')
						from (select name
										from m_zabol z
										join o_ank_zabol a on a.m_zabol_id = z.id and a.o_ank_id = s.o_ank_id
									for xml path ('')) fizz(buzz)) zabol,
				 s.id,
				 s.IS_FIRST_KONT_SEANS is_first_kont_seans,
				 isnull(convert(varchar(10),s.seans_date,120),'') seans_date,
         --#382
				 (select case
									 when a.ist_info = 4 then (select max(isnull(surname,'') + ' ' +isnull(name,'') + isnull(secname,'')) from dbo.O_ANK where id = a.fio_info_id)
									 when a.ist_info = 1 then (
										 select case
															when count(*)>0 then max(isnull(u.surname,'') + ' ' +isnull(substring(u.name,1,1)+ '. ','') + isnull(substring(u.secname,1,1)+ '.',''))
															else (select isnull(max(name),' ') from dbo.M_IST_INF where id = a.ist_info and not exists(select 1 from dbo.O_KONT_ANK k where k.O_ANK_ID = a.ID))
														end
											 from dbo.O_KONT_ANK k
											 join dbo.S_USER u on u.ID = k.USERID
										 where k.O_ANK_ID = a.ID)
									 else (select max(name) from dbo.M_IST_INF where id = a.ist_info)
								 end) ist_info,
				 --(select ','+replace(replace(replace(substring(buzz, 2, 20000),'</m_seans_time_id><m_seans_time_id>',','),'</m_seans_time_id>',''),'m_seans_time_id>','')+','
				 --	from (select distinct m_seans_time_id from o_seans s
				 --				 where cast(coalesce(s.seans_date,s.d_reg) as date) = cast(@date as date)
		     --      and s.m_org_id = @m_org_id
				 --for xml path ('')) fizz(buzz)) m_seans_time_ids,
         a.VIP vip,
         dbo.GET_ABON_DAY_COUNT_LAST(a.ID, @m_org_id) ostalos_dn_abon,
         dbo.GET_IS_ABON_ZADOL(a.ID, @m_org_id) isAbonZadol,
         dbo.GET_IS_ABON_VIPLACH(a.ID, @m_org_id) isAbonViplach
		from dbo.o_seans s
		join dbo.o_ank a on s.o_ank_id = a.id
		join dbo.m_seans_time t on s.m_seans_time_id = t.id and t.m_org_id = @m_org_id
	 where cast(coalesce(s.seans_date,s.d_reg) as date) = cast(@date as date)
		 and s.m_org_id = @m_org_id;
end;

go

set dateformat dmy;
declare @date date = cast('10.08.2017' as date);
exec dbo.GET_RECORD_DATA @date = @date, @m_org_id = 2